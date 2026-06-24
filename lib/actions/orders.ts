"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/isAdmin";

export async function updateOrderStatus(orderId: string, status: string): Promise<void> {
  await requireAdmin();
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);
  if (error) throw new Error(`updateOrderStatus: ${error.message}`);
  revalidatePath("/admin/orders");
}
