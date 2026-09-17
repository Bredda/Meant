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

export function getProviders() {
  return AI_PROVIDER_IDS.map((p) => ({
    apiKey: getMaskedProviderKey(p),
    providerId: p,
  })) as ConfiguredProvider[];
}

export function setProviderKey(providerId: AiProviderId, apiKey: string) {
  setSecret(toKey(providerId), apiKey);
}

export function deleteProviderKey(providerId: AiProviderId) {
  deleteSecret(toKey(providerId));
}
