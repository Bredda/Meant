export const AI_PROVIDER_IDS = [
  "anthropic",
  "openai",
  "google",
  "openrouter",
  "deepseek",
  "ollama",
  "lmstudio",
] as const;

export type AiProviderId = (typeof AI_PROVIDER_IDS)[number];
