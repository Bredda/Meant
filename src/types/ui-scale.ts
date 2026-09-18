export const UI_SCALES = ["small", "default", "large"] as const;

export type UiScale = (typeof UI_SCALES)[number];

export const SCALES: {
  code: UiScale;
  label: string;
}[] = [
  {
    code: "small",
    label: "Small",
  },
  {
    code: "default",
    label: "Default",
  },
  {
    code: "large",
    label: "Large",
  },
];
