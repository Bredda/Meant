import { nativeTheme } from "electron";
import type { ThemeMode } from "@/types/theme-mode";

export function applyNativeThemeMode(mode: ThemeMode) {
  nativeTheme.themeSource = mode;
}
