import { type LucideIcon, Monitor, MoonIcon, SunIcon } from "lucide-react";

export const THEME_MODES = ["light", "dark", "system"] as const;

export type ThemeMode = (typeof THEME_MODES)[number];

export const THEMES: {
  code: ThemeMode;
  label: string;
  icon: LucideIcon;
}[] = [
  {
    code: "light",
    icon: SunIcon,
    label: "Light",
  },
  {
    code: "dark",
    icon: MoonIcon,
    label: "Dark",
  },
  {
    code: "system",
    icon: Monitor,
    label: "System",
  },
];
