export type ColorSpace = "oklab" | "srgb" | "linear_rgb" | "hsl";

export interface BlockDef {
  id: number;
  name: string;
  file: string;
  transparent: boolean;
  oklch: { L: number; C: number; H: number };
  oklab: { L: number; a: number; b: number };
  srgb: { r: number; g: number; b: number };
  linear_rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
}
