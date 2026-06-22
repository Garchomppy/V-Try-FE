"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/isAdmin";
import { parseProductFormData } from "@/lib/actions/parseProductForm";

async function uploadImageFiles(
  supabase: any,
  files: File[],
): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    if (file.size === 0) continue;
    const ext = file.name.split(".").pop() || "png" || "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;
    const { data, error } = await supabase.storage
      .from("products")
      .upload(fileName, file);
    if (error) {
      console.error("Lỗi upload ảnh:", error);
    } else if (data) {
      const { data: urlData } = supabase.storage
        .from("products")
        .getPublicUrl(data.path);
      urls.push(urlData.publicUrl);
    }
  }
  return urls;
}

export async function createProduct(formData: FormData): Promise<void> {
  await requireAdmin();
  const parsed = parseProductFormData(formData);

  if (!parsed.name || !parsed.price) {
    redirect(
      `/admin/products/new?error=${encodeURIComponent("Thiếu tên hoặc giá sản phẩm")}`,
    );
  }

  const supabase = await createServerSupabase();
  const uploadedUrls = await uploadImageFiles(supabase, parsed.imageFiles);
  const finalImages = [...parsed.images, ...uploadedUrls];

  const { error } = await supabase.from("products").insert({
    name: parsed.name,
    description: parsed.description,
    price: parsed.price,
    discount_percentage: parsed.discountPercentage,
    images: finalImages,
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

export async function updateProduct(
  id: string,
  formData: FormData,
): Promise<void> {
  await requireAdmin();
  const parsed = parseProductFormData(formData);

  if (!parsed.name || !parsed.price) {
    redirect(
      `/admin/products/${id}/edit?error=${encodeURIComponent("Thiếu tên hoặc giá sản phẩm")}`,
    );
  }

  const supabase = await createServerSupabase();
  const uploadedUrls = await uploadImageFiles(supabase, parsed.imageFiles);
  const finalImages = [...parsed.images, ...uploadedUrls];

  const { error } = await supabase
    .from("products")
    .update({
      name: parsed.name,
      description: parsed.description,
      price: parsed.price,
      discount_percentage: parsed.discountPercentage,
      images: finalImages,
      colors: parsed.colors,
      sizes: parsed.sizes,
    })
    .eq("id", id);

  if (error) {
    redirect(
      `/admin/products/${id}/edit?error=${encodeURIComponent(error.message)}`,
    );
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
