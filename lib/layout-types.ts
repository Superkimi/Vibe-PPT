export const LAYOUT_IDS = [
  "cover",
  "bullets",
  "metrics",
  "comparison",
  "process",
  "chart",
  "image-text",
  "closing",
] as const;

export type LayoutId = (typeof LAYOUT_IDS)[number];

export interface LayoutCapacity {
  maxTextElements?: number;
  maxCharts?: number;
  maxImages?: number;
  maxContentElements?: number;
}

export interface LayoutMeta {
  id: LayoutId;
  label: string;
  labelEn: string;
  description: string;
  descriptionEn: string;
  capacity: LayoutCapacity;
}
