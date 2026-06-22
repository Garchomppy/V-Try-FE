import { describe, it, expect, vi, beforeEach } from "vitest";
import { createProduct, updateProduct, deleteProduct } from "@/lib/actions/products";
import { updateOrderStatus } from "@/lib/actions/orders";
import {
  createPromotionAction,
  updatePromotionAction,
  deletePromotionAction,
} from "@/lib/actions/promotions";

// Mocking dependencies
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth/isAdmin", () => ({
  requireAdmin: vi.fn().mockResolvedValue(true),
}));

const mockSupabase = {
  from: vi.fn().mockReturnThis(),
  insert: vi.fn().mockResolvedValue({ error: null }),
  update: vi.fn().mockReturnThis(),
  eq: vi.fn().mockResolvedValue({ error: null }),
};

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabase: vi.fn().mockResolvedValue(mockSupabase),
}));

vi.mock("@/lib/actions/parseProductForm", () => ({
  parseProductFormData: vi.fn().mockReturnValue({
    name: "Test Product",
    price: 100000,
    description: "A test product",
    discountPercentage: 10,
    images: ["image1.png"],
    colors: ["red"],
    sizes: ["M"],
  }),
}));

vi.mock("@/lib/db/promotions", () => ({
  createPromotion: vi.fn().mockResolvedValue(true),
  updatePromotion: vi.fn().mockResolvedValue(true),
  deletePromotion: vi.fn().mockResolvedValue(true),
}));

describe("Admin Functions Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Product Actions", () => {
    it("createProduct should insert data and redirect", async () => {
      const formData = new FormData();
      const { redirect } = await import("next/navigation");
      const { revalidatePath } = await import("next/cache");

      await createProduct(formData);

      expect(mockSupabase.from).toHaveBeenCalledWith("products");
      expect(mockSupabase.insert).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith("/admin/products");
      expect(redirect).toHaveBeenCalledWith("/admin/products");
    });

    it("updateProduct should update data and redirect", async () => {
      const formData = new FormData();
      const { redirect } = await import("next/navigation");
      const { revalidatePath } = await import("next/cache");

      await updateProduct("123", formData);

      expect(mockSupabase.from).toHaveBeenCalledWith("products");
      expect(mockSupabase.update).toHaveBeenCalled();
      expect(mockSupabase.eq).toHaveBeenCalledWith("id", "123");
      expect(revalidatePath).toHaveBeenCalledWith("/admin/products");
      expect(redirect).toHaveBeenCalledWith("/admin/products");
    });

    it("deleteProduct should update is_active to false", async () => {
      const { revalidatePath } = await import("next/cache");

      await deleteProduct("123");

      expect(mockSupabase.from).toHaveBeenCalledWith("products");
      expect(mockSupabase.update).toHaveBeenCalledWith({ is_active: false });
      expect(mockSupabase.eq).toHaveBeenCalledWith("id", "123");
      expect(revalidatePath).toHaveBeenCalledWith("/admin/products");
    });
  });

  describe("Order Actions", () => {
    it("updateOrderStatus should update order status and revalidate", async () => {
      const { revalidatePath } = await import("next/cache");

      await updateOrderStatus("order-1", "SHIPPED");

      expect(mockSupabase.from).toHaveBeenCalledWith("orders");
      expect(mockSupabase.update).toHaveBeenCalledWith({ status: "SHIPPED" });
      expect(mockSupabase.eq).toHaveBeenCalledWith("id", "order-1");
      expect(revalidatePath).toHaveBeenCalledWith("/admin/orders");
    });
  });

  describe("Promotion Actions", () => {
    it("createPromotionAction should create promotion and redirect", async () => {
      const { redirect } = await import("next/navigation");
      const { revalidatePath } = await import("next/cache");
      const { createPromotion } = await import("@/lib/db/promotions");

      const formData = new FormData();
      formData.append("name", "Promo 1");
      formData.append("discountPercentage", "20");

      await createPromotionAction(formData, ["prod-1"]);

      expect(createPromotion).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith("/admin/promotions");
      expect(revalidatePath).toHaveBeenCalledWith("/admin/products");
      expect(redirect).toHaveBeenCalledWith("/admin/promotions");
    });

    it("updatePromotionAction should update promotion and redirect", async () => {
      const { redirect } = await import("next/navigation");
      const { revalidatePath } = await import("next/cache");
      const { updatePromotion } = await import("@/lib/db/promotions");

      const formData = new FormData();
      formData.append("name", "Promo 1 Update");
      formData.append("discountPercentage", "25");

      await updatePromotionAction("promo-1", formData, ["prod-1"]);

      expect(updatePromotion).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith("/admin/promotions");
      expect(revalidatePath).toHaveBeenCalledWith("/admin/products");
      expect(redirect).toHaveBeenCalledWith("/admin/promotions");
    });

    it("deletePromotionAction should delete promotion and revalidate", async () => {
      const { revalidatePath } = await import("next/cache");
      const { deletePromotion } = await import("@/lib/db/promotions");

      await deletePromotionAction("promo-1");

      expect(deletePromotion).toHaveBeenCalledWith("promo-1");
      expect(revalidatePath).toHaveBeenCalledWith("/admin/promotions");
      expect(revalidatePath).toHaveBeenCalledWith("/admin/products");
    });
  });
});
