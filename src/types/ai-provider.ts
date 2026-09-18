export const AI_PROVIDER_IDS = ["anthropic", "openai", "google"] as const;

export type AiProviderId = (typeof AI_PROVIDER_IDS)[number];
