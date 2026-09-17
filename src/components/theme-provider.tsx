import { createContext, useContext, useEffect, useState } from "react";
import { getUserConfig, saveUserConfig } from "@/actions/settings";
import type { ThemeMode } from "@/types/theme-mode";

interface ThemeProviderProps {
  children: React.ReactNode;
}

interface ThemeProviderState {
  resolvedTheme: "dark" | "light";
  theme: ThemeMode;
  toggleTheme: () => void;
}

const initialState: ThemeProviderState = {
  resolvedTheme: "light",
  theme: "system",
  toggleTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

function resolveTheme(theme: ThemeMode): "dark" | "light" {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return theme;
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [theme, setTheme] = useState<ThemeMode>("system");
  const resolvedTheme = resolveTheme(theme);

  useEffect(() => {
    getUserConfig().then((config) => setTheme(config.theme));
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);
  }, [resolvedTheme]);

  const toggleTheme = async () => {
    const newTheme = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    await saveUserConfig({ theme: newTheme });
  };

  const value = {
    resolvedTheme,
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
