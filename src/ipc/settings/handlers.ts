import { os } from "@orpc/server";
import { getUserConfig, saveUserConfig } from "@/services/settings";
import { updateUserConfigInputSchema } from "./schemas";

export const getConfig = os.handler(() => getUserConfig());

export const saveConfig = os
  .input(updateUserConfigInputSchema)
  .handler(({ input }) => saveUserConfig(input));
