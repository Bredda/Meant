#!/usr/bin/env tsx
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type ProviderId = "anthropic" | "google" | "openai";

interface ProviderFetcher {
  envKey: string;
  fetchModels: (apiKey: string) => Promise<unknown>;
}

const OUTPUT_DIR = path.resolve(import.meta.dirname, "raw");
const ENV_LOCAL_PATH = path.resolve(import.meta.dirname, "../../.env.local");

async function fetchAnthropicModels(apiKey: string) {
  const response = await fetch("https://api.anthropic.com/v1/models?limit=1000", {
    headers: {
      "anthropic-version": "2023-06-01",
      "x-api-key": apiKey,
    },
  });
  if (!response.ok) {
    throw new Error(
      `Anthropic API responded with ${response.status}: ${await response.text()}`
    );
  }
  return response.json();
}

async function fetchOpenAiModels(apiKey: string) {
  const response = await fetch("https://api.openai.com/v1/models", {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!response.ok) {
    throw new Error(
      `OpenAI API responded with ${response.status}: ${await response.text()}`
    );
  }
  return response.json();
}

async function fetchGoogleModels(apiKey: string) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?pageSize=1000&key=${apiKey}`
  );
  if (!response.ok) {
    throw new Error(
      `Google API responded with ${response.status}: ${await response.text()}`
    );
  }
  return response.json();
}

const PROVIDERS: Record<ProviderId, ProviderFetcher> = {
  anthropic: { envKey: "ANTHROPIC_API_KEY", fetchModels: fetchAnthropicModels },
  google: { envKey: "GOOGLE_API_KEY", fetchModels: fetchGoogleModels },
  openai: { envKey: "OPENAI_API_KEY", fetchModels: fetchOpenAiModels },
};

async function loadEnvLocal() {
  if (!existsSync(ENV_LOCAL_PATH)) {
    return;
  }

  const content = await readFile(ENV_LOCAL_PATH, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed
      .slice(separatorIndex + 1)
      .trim()
      .replace(/^["']|["']$/g, "");

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

async function fetchAndDump(providerId: ProviderId, { envKey, fetchModels }: ProviderFetcher) {
  const apiKey = process.env[envKey];
  if (!apiKey) {
    throw new Error(`missing ${envKey} in environment, skipping`);
  }

  const data = await fetchModels(apiKey);
  const outputPath = path.join(OUTPUT_DIR, `${providerId}.json`);
  await writeFile(outputPath, JSON.stringify(data, null, 2), "utf8");
  return outputPath;
}

async function main() {
  await loadEnvLocal();
  await mkdir(OUTPUT_DIR, { recursive: true });

  const providerIds = Object.keys(PROVIDERS) as ProviderId[];
  const results = await Promise.allSettled(
    providerIds.map((providerId) => fetchAndDump(providerId, PROVIDERS[providerId]))
  );

  let hasFailure = false;
  for (const [index, result] of results.entries()) {
    const providerId = providerIds[index];
    if (result.status === "fulfilled") {
      console.log(`[${providerId}] wrote ${result.value}`);
    } else {
      hasFailure = true;
      const message =
        result.reason instanceof Error ? result.reason.message : String(result.reason);
      console.warn(`[${providerId}] ${message}`);
    }
  }

  if (hasFailure) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
