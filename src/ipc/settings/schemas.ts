import { z } from "zod";
import { THEME_MODES } from "@/types/theme-mode";
import { UI_SCALES } from "@/types/ui-scale";

export const themeModeSchema = z.enum(THEME_MODES);
export const uiScaleSchema = z.enum(UI_SCALES);

export const userConfigSchema = z.object({
  theme: themeModeSchema.default("system"),
  uiScale: uiScaleSchema.default("default"),
});

export type UserConfig = z.infer<typeof userConfigSchema>;

export const updateUserConfigInputSchema = userConfigSchema.partial();

export type UpdateUserConfigInput = z.infer<typeof updateUserConfigInputSchema>;
