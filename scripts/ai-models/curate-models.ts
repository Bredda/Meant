#!/usr/bin/env tsx
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { type AiModel, aiModelSchema } from "@/types/ai-model";
import type { AiProviderId } from "@/types/ai-provider";

const RAW_DIR = path.resolve(import.meta.dirname, "raw");
const OUTPUT_DIR = path.resolve(import.meta.dirname, "curated");
const OUTPUT_PATH = path.join(OUTPUT_DIR, "catalog.draft.json");

// Shipped as an explicit placeholder — pricing isn't available from any of
// these list-models endpoints, fill it in by hand from each provider's
// pricing page.
const ZERO_PRICING = { input: 0, output: 0 };

// Shared across providers: none of the "preview"/"-latest" builds should
// ever win a flagship pick over a stable release.
const PREVIEW_PATTERN = /preview/;

// --- Anthropic -------------------------------------------------------------

interface AnthropicRawModel {
  capabilities?: {
    image_input?: { supported?: boolean };
    structured_outputs?: { supported?: boolean };
    thinking?: { supported?: boolean };
  };
  display_name: string;
  id: string;
  max_input_tokens: number;
  max_tokens: number;
}

function mapAnthropicModel(raw: AnthropicRawModel): AiModel {
  return {
    capabilities: {
      // Not exposed by /v1/models; today's Claude chat models all support
      // tool use, so this defaults true — verify when new families ship.
      reasoning: raw.capabilities?.thinking?.supported ?? false,
      structuredOutput:
        raw.capabilities?.structured_outputs?.supported ?? false,
      tools: true,
      vision: raw.capabilities?.image_input?.supported ?? false,
    },
    contextWindow: raw.max_input_tokens,
    displayName: raw.display_name,
    id: `anthropic:${raw.id}`,
    maxOutputTokens: raw.max_tokens,
    modelId: raw.id,
    pricing: ZERO_PRICING,
    providerId: "anthropic",
    type: "llm",
  };
}

// One flagship per family (Haiku/Sonnet/Opus/Fable), the highest non-preview
// version. Version segments are short (<=2 digits) hyphen-separated numbers,
// e.g. "claude-opus-4-5-20251101" -> 4.5 (the trailing date is 8 digits and
// gets filtered out).
const ANTHROPIC_FAMILIES = ["fable", "haiku", "opus", "sonnet"] as const;
const ANTHROPIC_VERSION_SEGMENT_PATTERN = /^\d{1,2}$/;

function extractAnthropicVersion(modelId: string): number {
  const segments = modelId
    .split("-")
    .filter((s) => ANTHROPIC_VERSION_SEGMENT_PATTERN.test(s));
  const [major, minor] = segments.map(Number);
  return (major ?? 0) + (minor ?? 0) / 10;
}

function pickAnthropicFlagships(
  models: Extract<AiModel, { type: "llm" }>[]
): Extract<AiModel, { type: "llm" }>[] {
  const picked: Extract<AiModel, { type: "llm" }>[] = [];
  for (const family of ANTHROPIC_FAMILIES) {
    const candidates = models.filter(
      (m) => m.modelId.includes(family) && !PREVIEW_PATTERN.test(m.modelId)
    );
    if (candidates.length === 0) {
      console.warn(
        `[anthropic] no stable release found for family "${family}"`
      );
      continue;
    }
    const best = candidates.reduce((a, b) =>
      extractAnthropicVersion(b.modelId) > extractAnthropicVersion(a.modelId)
        ? b
        : a
    );
    picked.push(best);
  }
  return picked;
}

function curateAnthropic(raw: { data: AnthropicRawModel[] }): AiModel[] {
  const mapped = raw.data.map(mapAnthropicModel) as Extract<
    AiModel,
    { type: "llm" }
  >[];
  return pickAnthropicFlagships(mapped);
}

// --- Google ------------------------------------------------------------

interface GoogleRawModel {
  displayName: string;
  inputTokenLimit: number;
  name: string;
  outputTokenLimit: number;
  supportedGenerationMethods?: string[];
  thinking?: boolean;
}

const GOOGLE_MODEL_NAME_PREFIX_PATTERN = /^models\//;

function toGoogleModelId(name: string) {
  return name.replace(GOOGLE_MODEL_NAME_PREFIX_PATTERN, "");
}

function mapGoogleModel(raw: GoogleRawModel): AiModel | null {
  const methods = raw.supportedGenerationMethods ?? [];
  const modelId = toGoogleModelId(raw.name);
  const base = {
    displayName: raw.displayName,
    id: `google:${modelId}`,
    modelId,
    pricing: ZERO_PRICING,
    providerId: "google" as const,
  };

  if (methods.includes("embedContent")) {
    return { ...base, maxInputTokens: raw.inputTokenLimit, type: "embedding" };
  }

  if (methods.includes("generateContent")) {
    return {
      ...base,
      capabilities: {
        // Not derivable from the API for vision/tools/structured output —
        // verify manually per model.
        reasoning: raw.thinking ?? false,
        structuredOutput: false,
        tools: false,
        vision: false,
      },
      contextWindow: raw.inputTokenLimit,
      maxOutputTokens: raw.outputTokenLimit,
      type: "llm",
    };
  }

  return null;
}

function curateGoogle(
  raw: { models: GoogleRawModel[] },
  skipped: string[]
): AiModel[] {
  const mapped: AiModel[] = [];
  for (const model of raw.models) {
    const result = mapGoogleModel(model);
    if (result) {
      mapped.push(result);
    } else {
      skipped.push(model.name);
    }
  }

  const embeddings = mapped.filter(
    (m): m is Extract<AiModel, { type: "embedding" }> => m.type === "embedding"
  );
  const flagshipLlms = pickGoogleFlagships(mapped);
  return [...flagshipLlms, ...pickLatestGoogleEmbedding(embeddings)];
}

// Only one embedding family today, so just keep the highest non-preview
// version, e.g. "gemini-embedding-2" over "-001" and "-2-preview".
function extractGoogleEmbeddingVersion(modelId: string): number {
  const match = modelId.match(GOOGLE_EMBEDDING_VERSION_PATTERN);
  return match ? Number.parseInt(match[1], 10) : 0;
}

function pickLatestGoogleEmbedding(
  embeddings: Extract<AiModel, { type: "embedding" }>[]
): Extract<AiModel, { type: "embedding" }>[] {
  const stable = embeddings.filter((m) => !PREVIEW_PATTERN.test(m.modelId));
  if (stable.length === 0) {
    return [];
  }
  const best = stable.reduce((a, b) =>
    extractGoogleEmbeddingVersion(b.modelId) >
    extractGoogleEmbeddingVersion(a.modelId)
      ? b
      : a
  );
  return [best];
}

// Google's naming is messy (preview/image/tts/transcribe/live/customtools
// variants, a "-latest" alias, and the unrelated Gemma open-weight line), so
// unlike Anthropic/OpenAI there's no small hand-curated set to fall back on.
// This narrows the LLM list down to one candidate per quality/price tier
// (pro / flash / flash-lite), picking the highest version number per tier.
// Treat the result as a starting point to eyeball, not a verified pick.
type GoogleTier = "flash" | "flash-lite" | "pro";
const GOOGLE_TIER_ORDER: GoogleTier[] = ["pro", "flash", "flash-lite"];
const GOOGLE_VARIANT_EXCLUDE_PATTERN =
  /(customtools|image|latest|live|omni|transcribe|tts)/;
const GOOGLE_VERSION_PATTERN = /gemini-(\d+(?:\.\d+)?)/;
const GOOGLE_EMBEDDING_VERSION_PATTERN = /embedding-(\d+)/;

function detectGoogleTier(modelId: string): GoogleTier | null {
  if (modelId.startsWith("gemma")) {
    return null;
  }
  if (modelId.includes("flash-lite")) {
    return "flash-lite";
  }
  if (modelId.includes("flash")) {
    return "flash";
  }
  if (modelId.includes("pro")) {
    return "pro";
  }
  return null;
}

function extractGoogleVersion(modelId: string): number {
  const match = modelId.match(GOOGLE_VERSION_PATTERN);
  return match ? Number.parseFloat(match[1]) : 0;
}

function isBetterCandidate(
  candidate: Extract<AiModel, { type: "llm" }>,
  current: Extract<AiModel, { type: "llm" }> | undefined
): boolean {
  if (!current) {
    return true;
  }
  return (
    extractGoogleVersion(candidate.modelId) >
    extractGoogleVersion(current.modelId)
  );
}

function pickBestPerTier(
  candidates: Extract<AiModel, { type: "llm" }>[]
): Map<GoogleTier, Extract<AiModel, { type: "llm" }>> {
  const byTier = new Map<GoogleTier, Extract<AiModel, { type: "llm" }>>();
  for (const model of candidates) {
    const tier = detectGoogleTier(model.modelId);
    if (!tier) {
      continue;
    }
    if (isBetterCandidate(model, byTier.get(tier))) {
      byTier.set(tier, model);
    }
  }
  return byTier;
}

function pickGoogleFlagships(models: AiModel[]): AiModel[] {
  const llmModels = models.filter(
    (m): m is Extract<AiModel, { type: "llm" }> => m.type === "llm"
  );

  const stable = llmModels.filter(
    (m) =>
      !(
        PREVIEW_PATTERN.test(m.modelId) ||
        GOOGLE_VARIANT_EXCLUDE_PATTERN.test(m.modelId)
      )
  );
  const byTier = pickBestPerTier(stable);

  // Fall back to preview builds only for tiers with no stable release yet,
  // and say so loudly — these need a human call before shipping.
  const previewFallback = llmModels.filter(
    (m) => !GOOGLE_VARIANT_EXCLUDE_PATTERN.test(m.modelId)
  );
  const withFallback = pickBestPerTier(previewFallback);
  for (const tier of GOOGLE_TIER_ORDER) {
    if (!byTier.has(tier) && withFallback.has(tier)) {
      const picked = withFallback.get(tier) as Extract<
        AiModel,
        { type: "llm" }
      >;
      console.warn(
        `[google] no stable release for tier "${tier}", falling back to preview build "${picked.modelId}" — verify before shipping`
      );
      byTier.set(tier, picked);
    }
  }

  for (const tier of GOOGLE_TIER_ORDER) {
    if (!byTier.has(tier)) {
      console.warn(`[google] no candidate found for tier "${tier}"`);
    }
  }

  return GOOGLE_TIER_ORDER.map((tier) => byTier.get(tier)).filter(
    (m): m is Extract<AiModel, { type: "llm" }> => m !== undefined
  );
}

// --- OpenAI ------------------------------------------------------------

interface OpenAiRawModel {
  id: string;
  shutdown_date: string | null;
}

const OPENAI_EMBEDDING_PATTERN = /^text-embedding-/;
const OPENAI_LLM_PATTERN = /^(chatgpt|gpt-|o[1-9])/;
const OPENAI_LLM_EXCLUDE_PATTERN =
  /(audio|image|instruct|realtime|search|transcribe|tts)/;

function classifyOpenAiModel(id: string): "embedding" | "llm" | null {
  if (OPENAI_EMBEDDING_PATTERN.test(id)) {
    return "embedding";
  }
  if (OPENAI_LLM_PATTERN.test(id) && !OPENAI_LLM_EXCLUDE_PATTERN.test(id)) {
    return "llm";
  }
  return null;
}

function hasScheduledShutdown(shutdownDate: string | null) {
  return shutdownDate !== null;
}

function mapOpenAiModel(raw: OpenAiRawModel): AiModel | null {
  const type = classifyOpenAiModel(raw.id);
  if (!type) {
    return null;
  }

  const base = {
    displayName: raw.id,
    id: `openai:${raw.id}`,
    modelId: raw.id,
    pricing: ZERO_PRICING,
    providerId: "openai" as const,
  };

  // OpenAI's /v1/models endpoint carries no capability or token-limit data,
  // so these are explicit placeholders (0 / all-false) to fill in by hand.
  if (type === "embedding") {
    return { ...base, maxInputTokens: 0, type: "embedding" };
  }
  return {
    ...base,
    capabilities: {
      reasoning: false,
      structuredOutput: false,
      tools: false,
      vision: false,
    },
    contextWindow: 0,
    maxOutputTokens: 0,
    type: "llm",
  };
}

// One flagship per family (Sol/Luna/Terra/Astra), the highest non-preview
// version, matched by a "-<family>" suffix so e.g. "gpt-5.6-sol" -> "sol".
const OPENAI_FLAGSHIP_FAMILIES = ["astra", "luna", "sol", "terra"] as const;
const OPENAI_VERSION_PATTERN = /(\d+(?:\.\d+)?)/;

function extractOpenAiVersion(modelId: string): number {
  const match = modelId.match(OPENAI_VERSION_PATTERN);
  return match ? Number.parseFloat(match[1]) : 0;
}

function pickOpenAiFlagships(
  models: Extract<AiModel, { type: "llm" }>[]
): Extract<AiModel, { type: "llm" }>[] {
  const picked: Extract<AiModel, { type: "llm" }>[] = [];
  for (const family of OPENAI_FLAGSHIP_FAMILIES) {
    const candidates = models.filter(
      (m) =>
        m.modelId.endsWith(`-${family}`) && !PREVIEW_PATTERN.test(m.modelId)
    );
    if (candidates.length === 0) {
      console.warn(`[openai] no stable release found for family "${family}"`);
      continue;
    }
    const best = candidates.reduce((a, b) =>
      extractOpenAiVersion(b.modelId) > extractOpenAiVersion(a.modelId) ? b : a
    );
    picked.push(best);
  }
  return picked;
}

function curateOpenAi(
  raw: { data: OpenAiRawModel[] },
  skipped: string[]
): AiModel[] {
  const mapped: AiModel[] = [];
  for (const model of raw.data) {
    if (hasScheduledShutdown(model.shutdown_date)) {
      skipped.push(`${model.id} (has a scheduled shutdown date)`);
      continue;
    }
    const result = mapOpenAiModel(model);
    if (result) {
      mapped.push(result);
    } else {
      skipped.push(model.id);
    }
  }

  // Embeddings are curated by hand — left untouched here.
  const embeddings = mapped.filter((m) => m.type === "embedding");
  const llmModels = mapped.filter(
    (m): m is Extract<AiModel, { type: "llm" }> => m.type === "llm"
  );
  return [...pickOpenAiFlagships(llmModels), ...embeddings];
}

// --- Orchestration -------------------------------------------------------

async function readRaw<T>(providerId: AiProviderId): Promise<T | null> {
  const rawPath = path.join(RAW_DIR, `${providerId}.json`);
  if (!existsSync(rawPath)) {
    console.warn(`[${providerId}] no raw dump found at ${rawPath}, skipping`);
    return null;
  }
  const content = await readFile(rawPath, "utf8");
  return JSON.parse(content) as T;
}

async function main() {
  const catalog: AiModel[] = [];

  const anthropicRaw = await readRaw<{ data: AnthropicRawModel[] }>(
    "anthropic"
  );
  if (anthropicRaw) {
    catalog.push(...curateAnthropic(anthropicRaw));
  }

  const googleSkipped: string[] = [];
  const googleRaw = await readRaw<{ models: GoogleRawModel[] }>("google");
  if (googleRaw) {
    catalog.push(...curateGoogle(googleRaw, googleSkipped));
  }
  if (googleSkipped.length > 0) {
    console.log(
      `[google] skipped ${googleSkipped.length} unclassified model(s):`
    );
    for (const id of googleSkipped) {
      console.log(`  - ${id}`);
    }
  }

  const openAiSkipped: string[] = [];
  const openAiRaw = await readRaw<{ data: OpenAiRawModel[] }>("openai");
  if (openAiRaw) {
    catalog.push(...curateOpenAi(openAiRaw, openAiSkipped));
  }
  if (openAiSkipped.length > 0) {
    console.log(
      `[openai] skipped ${openAiSkipped.length} unclassified/shutdown model(s):`
    );
    for (const id of openAiSkipped) {
      console.log(`  - ${id}`);
    }
  }

  catalog.sort((a, b) => a.id.localeCompare(b.id));

  const validated = aiModelSchema.array().parse(catalog);

  await mkdir(OUTPUT_DIR, { recursive: true });
  await writeFile(OUTPUT_PATH, JSON.stringify(validated, null, 2), "utf8");

  console.log(`\nWrote ${validated.length} model(s) to ${OUTPUT_PATH}`);
  console.log(
    "OpenAI entries have placeholder token limits/capabilities (no data from the API) — fill those in by hand before merging into the committed catalog."
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
