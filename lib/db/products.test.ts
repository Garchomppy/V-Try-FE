import { describe, it, expect } from "vitest";
import { mapRowToProduct, type ProductRow } from "@/lib/db/products";

const row: ProductRow = {
  id: "11111111-1111-1111-1111-111111111111",
  name: "Test Jacket",
  description: "desc",
  price: "95",
  discount_percentage: 20,
  images: ["/images/a.jpg"],
  colors: [{ name: "Black", hex: "#000000" }],
  sizes: ["S", "M"],
  reviews: { rating: 4.8, count: 110 },
  try_on: { sizing: { fit: "regular", sizeChart: [] } },
  is_active: true,
  created_at: "2026-06-16T00:00:00Z",
};

describe("mapRowToProduct", () => {
  it("maps snake_case row to Product and coerces price to number", () => {
    const p = mapRowToProduct(row);
    expect(p.id).toBe(row.id);
    expect(p.price).toBe(95);
    expect(typeof p.price).toBe("number");
    expect(p.discountPercentage).toBe(20);
    expect(p.tryOn?.sizing?.fit).toBe("regular");
  });

  it("maps null discount and missing try_on", () => {
    const p = mapRowToProduct({ ...row, discount_percentage: null, try_on: null });
    expect(p.discountPercentage).toBeNull();
    expect(p.tryOn).toBeUndefined();
  });
});
