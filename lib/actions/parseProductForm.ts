export interface ParsedProductInput {
  name: string;
  description: string;
  price: number;
  discountPercentage: number | null;
  images: string[];
  imageFiles: File[];
  colors: { name: string; hex: string }[];
  sizes: string[];
}

export function parseProductFormData(formData: FormData): ParsedProductInput {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const price = Number(formData.get("price") ?? 0);

  const discountRaw = String(formData.get("discountPercentage") ?? "").trim();
  const discountPercentage = discountRaw ? Number(discountRaw) : null;

  const imagesRaw = String(formData.get("images") ?? "");
  const images = imagesRaw
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const colorsRaw = String(formData.get("colors") ?? "");
  const colors = colorsRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((pair) => {
      const [colorName, hex] = pair.split(":").map((s) => s.trim());
      return { name: colorName, hex };
    });

  const sizesRaw = String(formData.get("sizes") ?? "");
  const sizes = sizesRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const imageFiles = formData.getAll("imageFiles").filter(
    (f): f is File => f !== null && typeof f === "object" && "size" in f && (f as File).size > 0
  );

  return { name, description, price, discountPercentage, images, imageFiles, colors, sizes };
}
