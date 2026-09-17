import { os } from "@orpc/server";
import {
  deleteProviderKey,
  getMaskedProviderKey,
  getProviders,
  hasAnyProviderKey,
  hasProviderKey,
  listConfiguredProviders,
  setProviderKey,
} from "@/services/ai-providers/service";
import { configuredProviderSchema, providerIdInputSchema } from "./schemas";

export const hasAnyProvider = os.handler(() => hasAnyProviderKey());

export const listProviders = os.handler(() => listConfiguredProviders());

export const hasProvider = os
  .input(providerIdInputSchema)
  .handler(({ input }) => hasProviderKey(input));

export const getMaskedProvider = os
  .input(providerIdInputSchema)
  .handler(({ input }) => getMaskedProviderKey(input));

export const setProvider = os
  .input(configuredProviderSchema)
  .handler(({ input }) => {
    setProviderKey(input.providerId, input.apiKey);
  });

export const deleteProvider = os
  .input(providerIdInputSchema)
  .handler(({ input }) => {
    deleteProviderKey(input);
  });

export const getAllProviders = os.handler(() => getProviders());
