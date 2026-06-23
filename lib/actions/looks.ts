"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import {
  createLook,
  deleteLook as deleteLookRow,
} from "@/lib/db/looks";

export interface SaveLookResult {
  ok: boolean;
  id?: string;
  error?: string;
}

export async function saveLook(
  name: string,
  itemProductIds: string[],
): Promise<SaveLookResult> {
  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { ok: false, error: "Bạn cần đăng nhập để lưu look." };

  const cleanName = name.trim();
  if (!cleanName) return { ok: false, error: "Hãy đặt tên cho look." };
  if (itemProductIds.length < 2) {
    return { ok: false, error: "Chọn ít nhất 2 món để tạo một look." };
  }

  const { id } = await createLook({
    userId: data.user.id,
    name: cleanName,
    itemProductIds,
  });

  revalidatePath("/styling");
  return { ok: true, id };
}

export async function deleteLook(id: string): Promise<SaveLookResult> {
  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { ok: false, error: "Bạn cần đăng nhập." };

  await deleteLookRow(id, data.user.id);
  revalidatePath("/styling");
  return { ok: true };
}
