import { create } from "zustand";
import { getUserConfig, saveUserConfig } from "@/actions/settings";
import type { UpdateUserConfigInput } from "@/ipc/settings/schemas";
import type { ThemeMode } from "@/types/theme-mode";
import type { UiScale } from "@/types/ui-scale";

interface SettingsState {
  load: () => Promise<void>;
  setTheme: (theme: ThemeMode) => Promise<void>;
  setUiScale: (uiScale: UiScale) => Promise<void>;
  theme: ThemeMode;
  toggleTheme: () => Promise<void>;
  uiScale: UiScale;
  updateSettings: (input: UpdateUserConfigInput) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  load: async () => {
    const config = await getUserConfig();
    set(config);
  },

  setTheme: (theme) => get().updateSettings({ theme }),

  setUiScale: (uiScale) => get().updateSettings({ uiScale }),

  theme: "system",

  toggleTheme: () => {
    const next = resolveTheme(get().theme) === "dark" ? "light" : "dark";
    return get().updateSettings({ theme: next });
  },

  uiScale: "default",

  updateSettings: async (input) => {
    const config = await saveUserConfig(input);
    set(config);
  },
}));

export function resolveTheme(theme: ThemeMode): "dark" | "light" {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return theme;
}

export function useResolvedTheme(): "dark" | "light" {
  return useSettingsStore((s) => resolveTheme(s.theme));
}
