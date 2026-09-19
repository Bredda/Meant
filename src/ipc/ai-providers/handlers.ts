import { os } from "@orpc/server";
import { listAvailableLlms } from "@/server/services/ai-models-service";
import {
  deleteProviderKey,
  getMaskedProviderKey,
  getProviders,
  hasAnyProviderKey,
  hasProviderKey,
  listConfiguredProviders,
  trySettingProviderKey,
} from "@/server/services/ai-providers-service";
import { configuredProviderSchema, providerIdInputSchema } from "./schemas";

export const hasAnyProvider = os.handler(() => hasAnyProviderKey());

export const listProviders = os.handler(() => listConfiguredProviders());

export const hasProvider = os
  .input(providerIdInputSchema)
  .handler(({ input }) => hasProviderKey(input));

export const getMaskedProvider = os
  .input(providerIdInputSchema)
  .handler(({ input }) => getMaskedProviderKey(input));

export const trySettingProvider = os
  .input(configuredProviderSchema)
  .handler(
    async ({ input }) =>
      await trySettingProviderKey(input.providerId, input.apiKey)
  );

export const deleteProvider = os
  .input(providerIdInputSchema)
  .handler(({ input }) => {
    deleteProviderKey(input);
  });

export const getAllProviders = os.handler(() => getProviders());

export const listConfiguredProvidersModels = os.handler(() =>
  listAvailableLlms()
);
