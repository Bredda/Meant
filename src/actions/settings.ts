import { ipc } from "@/ipc/manager";
import type { UpdateUserConfigInput } from "@/ipc/settings/schemas";

export function getUserConfig() {
  return ipc.client.settings.getConfig();
}

export function saveUserConfig(input: UpdateUserConfigInput) {
  return ipc.client.settings.saveConfig(input);
}
