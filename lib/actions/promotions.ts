"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/isAdmin";
import { createPromotion, updatePromotion, deletePromotion } from "@/lib/db/promotions";

export async function createPromotionAction(
  formData: FormData,
  productIds: string[]
): Promise<void> {
  await requireAdmin();

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const discountPercentageStr = formData.get("discountPercentage") as string;
  const startDateStr = formData.get("startDate") as string;
  const endDateStr = formData.get("endDate") as string;
  const isActive = formData.get("isActive") === "true";

  const discountPercentage = parseInt(discountPercentageStr, 10);

  if (!name || isNaN(discountPercentage)) {
    redirect(
      `/admin/promotions/new?error=${encodeURIComponent(
        "Vui lòng nhập tên chương trình và phần trăm giảm giá hợp lệ"
      )}`
    );
  }

  try {
    await createPromotion(
      {
        name,
        description: description || null,
        discountPercentage,
        startDate: startDateStr || null,
        endDate: endDateStr || null,
        isActive,
      },
      productIds
    );
  } catch (error: any) {
    redirect(
      `/admin/promotions/new?error=${encodeURIComponent(
        error.message || "Đã xảy ra lỗi khi tạo chương trình khuyến mãi"
      )}`
    );
  }

  revalidatePath("/admin/promotions");
  revalidatePath("/admin/products");
  redirect("/admin/promotions");
}

export async function updatePromotionAction(
  id: string,
  formData: FormData,
  productIds: string[]
): Promise<void> {
  await requireAdmin();

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const discountPercentageStr = formData.get("discountPercentage") as string;
  const startDateStr = formData.get("startDate") as string;
  const endDateStr = formData.get("endDate") as string;
  const isActive = formData.get("isActive") === "true";

  const discountPercentage = parseInt(discountPercentageStr, 10);

  if (!name || isNaN(discountPercentage)) {
    redirect(
      `/admin/promotions/${id}/edit?error=${encodeURIComponent(
        "Vui lòng nhập tên chương trình và phần trăm giảm giá hợp lệ"
      )}`
    );
  }

  try {
    await updatePromotion(
      id,
      {
        name,
        description: description || null,
        discountPercentage,
        startDate: startDateStr || null,
        endDate: endDateStr || null,
        isActive,
      },
      productIds
    );
  } catch (error: any) {
    redirect(
      `/admin/promotions/${id}/edit?error=${encodeURIComponent(
        error.message || "Đã xảy ra lỗi khi cập nhật chương trình khuyến mãi"
      )}`
    );
  }

  revalidatePath("/admin/promotions");
  revalidatePath("/admin/products");
  redirect("/admin/promotions");
}

export async function deletePromotionAction(id: string): Promise<void> {
  await requireAdmin();
  try {
    await deletePromotion(id);
  } catch (error: any) {
    throw new Error(`Xóa khuyến mãi thất bại: ${error.message}`);
  }
  revalidatePath("/admin/promotions");
  revalidatePath("/admin/products");
}
