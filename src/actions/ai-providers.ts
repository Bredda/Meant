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

export function setProviderKey(input: ConfiguredProvider) {
  return ipc.client.aiProviders.setProvider(input);
}

export function deleteProviderKey(providerId: ProviderIdInput) {
  return ipc.client.aiProviders.deleteProvider(providerId);
}
