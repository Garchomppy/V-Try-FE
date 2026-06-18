"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/isAdmin";
import { parseProductFormData } from "@/lib/actions/parseProductForm";

export async function createProduct(formData: FormData): Promise<void> {
  await requireAdmin();
  const parsed = parseProductFormData(formData);

  if (!parsed.name || !parsed.price) {
    redirect(`/admin/products/new?error=${encodeURIComponent("Thiếu tên hoặc giá sản phẩm")}`);
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.from("products").insert({
    name: parsed.name,
    description: parsed.description,
    price: parsed.price,
    discount_percentage: parsed.discountPercentage,
    images: parsed.images,
    colors: parsed.colors,
    sizes: parsed.sizes,
    is_active: true,
  });

  if (error) {
    redirect(`/admin/products/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function updateProduct(id: string, formData: FormData): Promise<void> {
  await requireAdmin();
  const parsed = parseProductFormData(formData);

  if (!parsed.name || !parsed.price) {
    redirect(`/admin/products/${id}/edit?error=${encodeURIComponent("Thiếu tên hoặc giá sản phẩm")}`);
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("products")
    .update({
      name: parsed.name,
      description: parsed.description,
      price: parsed.price,
      discount_percentage: parsed.discountPercentage,
      images: parsed.images,
      colors: parsed.colors,
      sizes: parsed.sizes,
    })
    .eq("id", id);

  if (error) {
    redirect(`/admin/products/${id}/edit?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function deleteProduct(id: string): Promise<void> {
  await requireAdmin();
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("products")
    .update({ is_active: false })
    .eq("id", id);
  if (error) throw new Error(`deleteProduct: ${error.message}`);
  revalidatePath("/admin/products");
}
