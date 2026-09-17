export const UI_SCALES = ["small", "default", "large"] as const;

export type UiScale = (typeof UI_SCALES)[number];
