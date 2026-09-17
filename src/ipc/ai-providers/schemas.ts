import { z } from "zod";
import { AI_PROVIDER_IDS } from "@/types/ai-provider";

export const providerIdInputSchema = z.enum(AI_PROVIDER_IDS);

export type ProviderIdInput = z.infer<typeof providerIdInputSchema>;

export const configuredProviderSchema = z.object({
  apiKey: z.string().min(1),
  providerId: providerIdInputSchema,
});

export type ConfiguredProvider = z.infer<typeof configuredProviderSchema>;
