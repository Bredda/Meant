import type {
  ConfiguredProvider,
  ProviderIdInput,
} from "@/ipc/ai-providers/schemas";
import { ipc } from "@/ipc/manager";

export function hasAnyProvider() {
  return ipc.client.aiProviders.hasAnyProvider();
}

export function listConfiguredProviders() {
  return ipc.client.aiProviders.listProviders();
}

export function getMaskedProviderKey(providerId: ProviderIdInput) {
  return ipc.client.aiProviders.getMaskedProvider(providerId);
}

export function getProvidersSettings() {
  return ipc.client.aiProviders.getAllProviders();
}

export function trySettingProviderKey(input: ConfiguredProvider) {
  return ipc.client.aiProviders.trySettingProvider(input);
}

export function deleteProviderKey(providerId: ProviderIdInput) {
  return ipc.client.aiProviders.deleteProvider(providerId);
}

export function listAvailableLlms() {
  return ipc.client.aiProviders.listConfiguredProvidersModels()
}

/**
 * Picks a model for the first configured provider (in AI_PROVIDER_IDS
 * order). Only meaningful once a real model picker exists — the graph
 * itself currently only knows how to talk to Anthropic regardless of
 * what's returned here.
 */
export async function getDefaultModel(): Promise<string> {
  return "";
}
