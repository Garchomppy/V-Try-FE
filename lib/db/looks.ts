import { createServerSupabase } from "@/lib/supabase/server";

export interface LookRow {
  id: string;
  user_id: string;
  name: string;
  item_product_ids: string[];
  created_at: string;
}

export interface Look {
  id: string;
  userId: string;
  name: string;
  itemProductIds: string[];
  createdAt: string;
}

export function mapRowToLook(row: LookRow): Look {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    itemProductIds: row.item_product_ids ?? [],
    createdAt: row.created_at,
  };
}

export interface CreateLookPayload {
  userId: string;
  name: string;
  itemProductIds: string[];
}

export async function createLook(payload: CreateLookPayload): Promise<{ id: string }> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("looks")
    .insert({
      user_id: payload.userId,
      name: payload.name,
      item_product_ids: payload.itemProductIds,
    })
    .select("id")
    .single();
  if (error) throw new Error(`createLook: ${error.message}`);
  return { id: data.id };
}

export async function getLooksByUserId(userId: string): Promise<Look[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("looks")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`getLooksByUserId: ${error.message}`);
  return (data as LookRow[]).map(mapRowToLook);
}

export async function getLookById(id: string): Promise<Look | null> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("looks")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`getLookById: ${error.message}`);
  return data ? mapRowToLook(data as LookRow) : null;
}

export async function deleteLook(id: string, userId: string): Promise<void> {
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("looks")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error(`deleteLook: ${error.message}`);
}
