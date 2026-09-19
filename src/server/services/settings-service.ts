import fs from "node:fs";
import path from "node:path";
import { app } from "electron";
import {
  type UpdateUserConfigInput,
  type UserConfig,
  userConfigSchema,
} from "@/ipc/settings/schemas";
import { applyNativeThemeMode } from "@/server/services/theme-service";

const CONFIG_PATH = path.join(app.getPath("userData"), "config.json");

const DEFAULT_CONFIG = userConfigSchema.parse({});

function readConfigFile(): unknown {
  if (!fs.existsSync(CONFIG_PATH)) {
    return {};
  }
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
  } catch {
    return {};
  }
}

export function getUserConfig(): UserConfig {
  const result = userConfigSchema.safeParse(readConfigFile());
  return result.success ? result.data : DEFAULT_CONFIG;
}

export function saveUserConfig(input: UpdateUserConfigInput): UserConfig {
  const next = userConfigSchema.parse({ ...getUserConfig(), ...input });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(next, null, 2));

  if (input.theme !== undefined) {
    applyNativeThemeMode(next.theme);
  }

  return next;
}
