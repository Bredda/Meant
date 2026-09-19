import { useEffect } from "react";
import { useModelStore } from "@/stores/model-store";
import { useResolvedTheme, useSettingsStore } from "@/stores/settings-store";

interface AppProviderProps {
  children: React.ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const loadModels = useModelStore((s) => s.load);
  const loadSettings = useSettingsStore((s) => s.load);
  const uiScale = useSettingsStore((s) => s.uiScale);
  const resolvedTheme = useResolvedTheme();
  useEffect(() => {
    loadModels();
    loadSettings();
  }, [loadModels, loadSettings]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-font-scale", uiScale);
  }, [uiScale]);

  return children;
}
