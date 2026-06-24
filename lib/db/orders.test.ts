import { describe, it, expect } from "vitest";
import { buildOrderRow } from "@/lib/db/orders";
import type { CartItem } from "@/lib/store/cart";

const items: CartItem[] = [
  {
    productId: "abc",
    name: "Jacket",
    price: 120,
    image: "/img.jpg",
    size: "M",
    color: "#000",
    quantity: 2,
  },
];

describe("buildOrderRow", () => {
  it("computes subtotal correctly", () => {
    const row = buildOrderRow({
      customerName: "Nam",
      customerPhone: "0901234567",
      customerAddress: "123 Lê Lợi, HCM",
      note: "",
      items,
    });
    expect(row.subtotal).toBe(240);
  });

  it("maps camelCase fields to snake_case row", () => {
    const row = buildOrderRow({
      customerName: "Nam",
      customerPhone: "0901234567",
      customerAddress: "123 Lê Lợi, HCM",
      items,
    });
    expect(row.customer_name).toBe("Nam");
    expect(row.customer_phone).toBe("0901234567");
    expect(row.customer_address).toBe("123 Lê Lợi, HCM");
    expect(row.note).toBeUndefined();
    expect(row.items).toEqual(items);
    expect(row.status).toBe("pending");
  });

  it("sets user_id when provided", () => {
    const row = buildOrderRow({
      customerName: "Nam",
      customerPhone: "0901234567",
      customerAddress: "123 Lê Lợi, HCM",
      items,
      userId: "user-123",
    });
    expect(row.user_id).toBe("user-123");
  });

  it("sets user_id to null when not provided", () => {
    const row = buildOrderRow({
      customerName: "Nam",
      customerPhone: "0901234567",
      customerAddress: "123 Lê Lợi, HCM",
      items,
    });
    expect(row.user_id).toBeNull();
  });
});
