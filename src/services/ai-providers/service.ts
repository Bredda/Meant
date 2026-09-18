import type { ConfiguredProvider } from "@/ipc/ai-providers/schemas";
import {
  deleteSecret,
  getSecret,
  hasSecret,
  listKeys,
  setSecret,
} from "@/services/vault/store";
import { AI_PROVIDER_IDS, type AiProviderId } from "@/types/ai-provider";

const KEY_PREFIX = "ai-provider:";

function toKey(providerId: AiProviderId) {
  return `${KEY_PREFIX}${providerId}`;
}

function maskSecret(value: string): string {
  if (value.length <= 8) {
    return "*".repeat(value.length);
  }
  return `${value.slice(0, 4)}${"*".repeat(value.length - 8)}${value.slice(-4)}`;
}

export function hasAnyProviderKey(): boolean {
  return listKeys(KEY_PREFIX).length > 0;
}

export function hasProviderKey(providerId: AiProviderId): boolean {
  return hasSecret(toKey(providerId));
}

export function listConfiguredProviders(): AiProviderId[] {
  return listKeys(KEY_PREFIX).map(
    (key) => key.slice(KEY_PREFIX.length) as AiProviderId
  );
}

export function getMaskedProviderKey(providerId: AiProviderId): string | null {
  const secret = getSecret(toKey(providerId));
  return secret ? maskSecret(secret) : null;
}

export function getProviderKey(providerId: AiProviderId): string | null {
  return getSecret(toKey(providerId));
}

export function getProviders() {
  return AI_PROVIDER_IDS.map((p) => ({
    apiKey: getMaskedProviderKey(p),
    providerId: p,
  })) as ConfiguredProvider[];
}

export async function trySettingProviderKey(
  providerId: AiProviderId,
  apiKey: string
) {
  const { error } = await testProviderKey(providerId, apiKey);
  if (error) {
    return { error, provider: providerId };
  }
  setSecret(toKey(providerId), apiKey);
  return { error, provider: providerId };
}

export function deleteProviderKey(providerId: AiProviderId) {
  deleteSecret(toKey(providerId));
}

export function testProviderKey(providerId: AiProviderId, apiKey: string) {
  const fn = TESTER[providerId];
  return fn(apiKey);
}

async function fetchAnthropicModels(apiKey: string) {
  const response = await fetch(
    "https://api.anthropic.com/v1/models?limit=1000",
    {
      headers: {
        "anthropic-version": "2023-06-01",
        "x-api-key": apiKey,
      },
    }
  );
  if (!response.ok) {
    return {
      error: `Anthropic API responded with ${response.status}: ${await response.text()}`,
    };
  }
  return { error: null };
}

const TESTER: Record<
  AiProviderId,
  (apiKey: string) => Promise<{ error: string | null }>
> = {
  anthropic: fetchAnthropicModels,
  google: fetchGoogleModels,
  openai: fetchOpenAiModels,
};

async function fetchOpenAiModels(apiKey: string) {
  const response = await fetch("https://api.openai.com/v1/models", {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!response.ok) {
    return {
      error: `OpenAI API responded with ${response.status}: ${await response.text()}`,
    };
  }
  return { error: null };
}

async function fetchGoogleModels(apiKey: string) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?pageSize=1000&key=${apiKey}`
  );
  if (!response.ok) {
    return {
      error: `Google API responded with ${response.status}: ${await response.text()}`,
    };
  }
  return { error: null };
}
