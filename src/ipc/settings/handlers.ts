import { os } from "@orpc/server";
import {
  getUserConfig,
  saveUserConfig,
} from "@/server/services/settings-service";
import { updateUserConfigInputSchema } from "./schemas";

export const getConfig = os.handler(() => getUserConfig());

export const saveConfig = os
  .input(updateUserConfigInputSchema)
  .handler(({ input }) => saveUserConfig(input));
