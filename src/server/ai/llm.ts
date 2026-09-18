import { ChatAnthropic } from "@langchain/anthropic";
import type { Runnable } from "@langchain/core/runnables";
import type { z } from "zod";
import { getProviderKey } from "@/services/ai-providers/service";
import type { ModelConfig } from "@/types/agents";
import type { AiProviderId } from "@/types/ai-provider";

const extractProviderModel = (input: string) => {
  const parts = input.split(":");
  return { modelName: parts[1], providerId: parts[0] as AiProviderId };
};

export const getLlm = ({ model, temperature }: ModelConfig) => {
  const { modelName, providerId } = extractProviderModel(model);
  const apiKey = getProviderKey(providerId);
  if (!apiKey) {
    throw new Error(`Provider key not found for ${model}`);
  }
  return new ChatAnthropic({
    apiKey,
    model: modelName,
    temperature,
  });
};

export function getLlmStructured<T extends z.ZodType>(
  schema: T,
  config: ModelConfig
): Runnable<string, z.infer<T>> {
  return getLlm(config).withStructuredOutput(schema) as Runnable<
    string,
    z.infer<T>
  >;
}
