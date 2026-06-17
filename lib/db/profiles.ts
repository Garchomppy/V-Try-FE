import { createServerSupabase } from "@/lib/supabase/server";

export interface ProfileRow {
  id: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  fullName: string | null;
  phone: string | null;
  address: string | null;
}

export function mapRowToProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    address: row.address,
  };
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw new Error(`getProfile: ${error.message}`);
  return data ? mapRowToProfile(data as ProfileRow) : null;
}

// profiles row is guaranteed to exist via the handle_new_user trigger, so a plain update suffices
export async function updateProfile(
  userId: string,
  fields: { fullName?: string; phone?: string; address?: string },
): Promise<void> {
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fields.fullName,
      phone: fields.phone,
      address: fields.address,
    })
    .eq("id", userId);
  if (error) throw new Error(`updateProfile: ${error.message}`);
}
