import { useEffect } from "react";
import { useResolvedTheme, useSettingsStore } from "@/stores/settings-store";

interface SettingsProviderProps {
  children: React.ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const load = useSettingsStore((s) => s.load);
  const uiScale = useSettingsStore((s) => s.uiScale);
  const resolvedTheme = useResolvedTheme();

  useEffect(() => {
    load();
  }, [load]);

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
