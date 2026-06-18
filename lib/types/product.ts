export interface SizeChartEntry {
  size: string;
  chestCm: [number, number];
  waistCm: [number, number];
  hipsCm?: [number, number];
  lengthCm?: number;
}

export interface TryOnConfig {
  arOverlay?: {
    src: string;
    widthMultiplier?: number;
    aspectRatio?: number;
    verticalOffsetRatio?: number;
  };
  model3D?: {
    src: string;
    meshNodeNames: string[];
    baseScale: number;
    positionOffset?: [number, number, number];
  };
  sizing?: {
    fit: "slim-fit" | "regular" | "oversized";
    sizeChart: SizeChartEntry[];
  };
}

export interface Product {
  id: string;
  name: string;
  price: number;
  discountPercentage: number | null;
  description: string;
  images: string[];
  colors: { name: string; hex: string }[];
  sizes: string[];
  reviews: { rating: number; count: number };
  tryOn?: TryOnConfig;
  isActive?: boolean;
}
