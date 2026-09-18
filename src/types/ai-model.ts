import { z } from "zod";
import { AI_PROVIDER_IDS } from "@/types/ai-provider";

export const AI_MODEL_TYPES = ["llm", "embedding"] as const;
export type AiModelType = (typeof AI_MODEL_TYPES)[number];

export const modelPricingSchema = z.object({
  input: z.number(),
  output: z.number(),
});

export type ModelPricing = z.infer<typeof modelPricingSchema>;

const aiModelBaseSchema = z.object({
  displayName: z.string(),
  id: z.string(),
  modelId: z.string(),
  pricing: modelPricingSchema,
  providerId: z.enum(AI_PROVIDER_IDS),
});

export const llmCapabilitiesSchema = z.object({
  reasoning: z.boolean(),
  structuredOutput: z.boolean(),
  tools: z.boolean(),
  vision: z.boolean(),
});

export type LlmCapabilities = z.infer<typeof llmCapabilitiesSchema>;

export const llmModelSchema = aiModelBaseSchema.extend({
  capabilities: llmCapabilitiesSchema,
  contextWindow: z.number(),
  description: z.string(),
  maxOutputTokens: z.number(),
  type: z.literal("llm"),
});

export type LlmModel = z.infer<typeof llmModelSchema>;

export const embeddingModelSchema = aiModelBaseSchema.extend({
  dimensions: z.number().optional(),
  maxInputTokens: z.number(),
  type: z.literal("embedding"),
});

export type EmbeddingModel = z.infer<typeof embeddingModelSchema>;

export const aiModelSchema = z.discriminatedUnion("type", [
  llmModelSchema,
  embeddingModelSchema,
]);

export type AiModel = z.infer<typeof aiModelSchema>;
