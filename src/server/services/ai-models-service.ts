import { listConfiguredProviders } from "@/server/services/ai-providers-service";
import {
  aiModelSchema,
  type EmbeddingModel,
  type LlmModel,
} from "@/types/ai-model";
import catalogData from "./catalog.json";

export type { AiModel, EmbeddingModel, LlmModel } from "@/types/ai-model";

const CATALOG = aiModelSchema.array().parse(catalogData);

export function listAvailableLlms(): LlmModel[] {
  const configuredProviders = new Set(listConfiguredProviders());
  return CATALOG.filter(
    (model): model is LlmModel =>
      model.type === "llm" && configuredProviders.has(model.providerId)
  );
}

export function listAvailableEmbeddings(): EmbeddingModel[] {
  const configuredProviders = new Set(listConfiguredProviders());
  return CATALOG.filter(
    (model): model is EmbeddingModel =>
      model.type === "embedding" && configuredProviders.has(model.providerId)
  );
}
