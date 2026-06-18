import { describe, it, expect } from "vitest";
import { parseProductFormData } from "@/lib/actions/parseProductForm";

function buildFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

describe("parseProductFormData", () => {
  it("parses basic fields and coerces price to number", () => {
    const fd = buildFormData({
      name: "Áo thun",
      description: "Mô tả",
      price: "29.99",
      discountPercentage: "10",
      images: "/a.jpg\n/b.jpg",
      colors: "Đen:#000000, Trắng:#FFFFFF",
      sizes: "S, M, L",
    });
    const parsed = parseProductFormData(fd);
    expect(parsed.name).toBe("Áo thun");
    expect(parsed.price).toBe(29.99);
    expect(parsed.discountPercentage).toBe(10);
    expect(parsed.images).toEqual(["/a.jpg", "/b.jpg"]);
    expect(parsed.colors).toEqual([
      { name: "Đen", hex: "#000000" },
      { name: "Trắng", hex: "#FFFFFF" },
    ]);
    expect(parsed.sizes).toEqual(["S", "M", "L"]);
  });

  it("defaults discountPercentage to null when empty", () => {
    const fd = buildFormData({
      name: "Áo thun",
      description: "Mô tả",
      price: "29.99",
      discountPercentage: "",
      images: "/a.jpg",
      colors: "Đen:#000000",
      sizes: "S",
    });
    const parsed = parseProductFormData(fd);
    expect(parsed.discountPercentage).toBeNull();
  });
});
