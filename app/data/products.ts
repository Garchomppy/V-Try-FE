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
}

export const products: Product[] = [
  {
    id: "p1",
    name: "Men's Classic Leather Biker Jacket - Double Rider Style",
    price: 95,
    discountPercentage: null,
    description:
      "A timeless staple reimagined. Our Men's Classic Leather Biker Jacket combines rugged, rebellious heritage with modern tailoring. Crafted from premium, butter-soft lambskin leather that conforms to your body for a lived-in feel from the first wear.",
    images: ["/images/pic8.jpg", "/images/pic11.jpg", "/images/pic12.jpg"],
    colors: [
      { name: "Charcoal", hex: "#4b5563" },
      { name: "Forest Green", hex: "#064e3b" },
    ],
    sizes: ["28", "30", "32", "34", "36"],
    reviews: { rating: 4.8, count: 110 },
    tryOn: {
      arOverlay: {
        src: "/try-on/overlays/Black_Jacket.png",
        widthMultiplier: 2.2,
        aspectRatio: 1.1,
      },
      sizing: {
        fit: "regular",
        sizeChart: [
          { size: "28", waistCm: [71, 73], hipsCm: [86, 89], lengthCm: 102, chestCm: [0, 0] },
          { size: "30", waistCm: [76, 78], hipsCm: [91, 94], lengthCm: 103, chestCm: [0, 0] },
          { size: "32", waistCm: [81, 83], hipsCm: [96, 99], lengthCm: 104, chestCm: [0, 0] },
          { size: "34", waistCm: [86, 88], hipsCm: [101, 104], lengthCm: 105, chestCm: [0, 0] },
          { size: "36", waistCm: [91, 93], hipsCm: [106, 109], lengthCm: 106, chestCm: [0, 0] },
        ],
      },
    },
  },
  {
    id: "p2",
    name: "Over-Sized Mohair-Style Argyle Plaid Knit Hoodie",
    price: 85,
    discountPercentage: null,
    description:
      "Embrace laid-back luxury with our Over-Sized Mohair-Style Argyle Knit Hoodie. This piece captures the effortless cool of street style with the cozy texture of premium mohair. The relaxed, oversized fit drapes beautifully, creating a statement silhouette that’s both comfortable and fashion-forward.",
    images: ["/images/pic1.jpg", "/images/pic2.jpg", "/images/pic3.jpg"],
    colors: [
      { name: "Black", hex: "#000000" },
      { name: "Charcoal", hex: "#4b5563" },
    ],
    sizes: ["S", "M", "L", "XL"],
    reviews: { rating: 4.9, count: 89 },
    tryOn: {
      arOverlay: {
        src: "/try-on/overlays/p2-hoodie.png",
        widthMultiplier: 2.1,
        aspectRatio: 1.25,
      },
      model3D: {
        src: "/try-on/models/p2-hoodie.glb",
        meshNodeNames: ["AM_102_035_003_AM_102_035_002_0"],
        baseScale: 0.015,
        positionOffset: [0, 0.83, 0.1],
      },
      sizing: {
        fit: "regular",
        sizeChart: [
          { size: "S", chestCm: [88, 96], waistCm: [76, 84], lengthCm: 68 },
          { size: "M", chestCm: [96, 104], waistCm: [84, 92], lengthCm: 70 },
          { size: "L", chestCm: [104, 112], waistCm: [92, 100], lengthCm: 72 },
          { size: "XL", chestCm: [112, 120], waistCm: [100, 108], lengthCm: 74 },
        ],
      },
    },
  },
  {
    id: "p3",
    name: "Minimalist Sweatshirt",
    price: 75,
    discountPercentage: 20,
    description:
      "A clean, modern take on the classic sweatshirt. The Minimalist Sweatshirt is crafted from a mid-weight cotton blend, ensuring breathability and warmth. Perfect for a casual day out or lounging at home.",
    images: ["/images/pic4.jpg", "/images/pic6.jpg", "/images/pic7.jpg"],
    colors: [
      { name: "Light Grey", hex: "#e5e7eb" },
      { name: "Slate", hex: "#9ca3af" },
    ],
    sizes: ["M", "L", "XL", "XXL"],
    reviews: { rating: 4.7, count: 56 },
    tryOn: {
      arOverlay: {
        src: "/try-on/overlays/p3-sweatshirt.png",
        widthMultiplier: 2.0,
        aspectRatio: 1.2,
      },
      model3D: {
        src: "/try-on/models/p3-sweatshirt.glb",
        meshNodeNames: ["AM_102_035_003_AM_102_035_002_0"],
        baseScale: 0.015,
        positionOffset: [0, 0.83, 0.1],
      },
      sizing: {
        fit: "regular",
        sizeChart: [
          { size: "M", chestCm: [96, 104], waistCm: [84, 92], lengthCm: 70 },
          { size: "L", chestCm: [104, 112], waistCm: [92, 100], lengthCm: 72 },
          { size: "XL", chestCm: [112, 120], waistCm: [100, 108], lengthCm: 74 },
          { size: "XXL", chestCm: [120, 128], waistCm: [108, 116], lengthCm: 76 },
        ],
      },
    },
  },
  {
    id: "p4",
    name: "H&M Coolmax® Boat-Neck Tank Top",
    price: 120,
    discountPercentage: null,
    description:
      "Effortless style meets innovative comfort with the H&M Coolmax® Boat-Neck Tank Top. Designed for the modern minimalist, this tank top combines a flattering, wide boat neckline with high-performance Coolmax® fabric technology. Known for its superior breathability and moisture-wicking properties, Coolmax® keeps you cool, dry, and comfortable all day long.",
    images: ["/images/pic9.jpg", "/images/pic10.jpg"],
    colors: [{ name: "Washed Blue", hex: "#3b82f6" }],
    sizes: ["S", "M", "L", "XL"],
    reviews: { rating: 4.5, count: 42 },
    tryOn: {
      arOverlay: {
        src: "/try-on/overlays/p4-top-tank.png",
        widthMultiplier: 2.2,
        aspectRatio: 1.15,
      },
      model3D: {
        src: "/try-on/models/p4-denim-jacket.glb",
        meshNodeNames: [],
        baseScale: 0.015,
      },
      sizing: {
        fit: "regular",
        sizeChart: [
          { size: "S", chestCm: [92, 100], waistCm: [80, 88], lengthCm: 66 },
          { size: "M", chestCm: [100, 108], waistCm: [88, 96], lengthCm: 68 },
          { size: "L", chestCm: [108, 116], waistCm: [96, 104], lengthCm: 70 },
          { size: "XL", chestCm: [116, 124], waistCm: [104, 112], lengthCm: 72 },
        ],
      },
    },
  },
];
