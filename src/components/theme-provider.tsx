import { createContext, useContext, useEffect, useState } from "react";
import { LOCAL_STORAGE_KEYS } from "@/constants";
import { ipc } from "@/ipc/manager";
import type { ThemeMode } from "@/types/theme-mode";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
  storageKey?: string;
}

interface ThemeProviderState {
  syncWithLocalTheme: () => void;
  theme: ThemeMode;
  toggleTheme: () => void;
}

const initialState: ThemeProviderState = {
  syncWithLocalTheme: () => null,
  theme: "system",
  toggleTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = LOCAL_STORAGE_KEYS.THEME,
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<ThemeMode>(
    () => (localStorage.getItem(storageKey) as ThemeMode) || defaultTheme
  );

  useEffect(() => {
    syncWithLocalTheme();
  });

  const applyTheme = (newTheme: ThemeMode) => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.THEME, newTheme);
    setTheme(newTheme);
  };

  const toggleTheme = async () => {
    const isDarkMode = await ipc.client.theme.toggleThemeMode();
    const newTheme = isDarkMode ? "dark" : "light";
    applyTheme(newTheme);
  };

  const syncWithLocalTheme = async () => {
    const local = localStorage.getItem(
      LOCAL_STORAGE_KEYS.THEME
    ) as ThemeMode | null;
    if (!local) {
      applyTheme("system");
      return;
    }
    await applyTheme(local);
  };

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
      return;
    }
    root.classList.add(theme);
  }, [theme]);

  const value = {
    syncWithLocalTheme,
    theme,
    toggleTheme,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};
