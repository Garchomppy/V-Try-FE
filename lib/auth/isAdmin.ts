import { createServerSupabase } from "@/lib/supabase/server";

export interface CurrentUserRole {
  userId: string | null;
  role: string | null;
}

export async function getCurrentUserRole(): Promise<CurrentUserRole> {
  const supabase = await createServerSupabase();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return { userId: null, role: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .maybeSingle();

  return { userId: authData.user.id, role: profile?.role ?? null };
}

export async function requireAdmin(): Promise<string> {
  const { userId, role } = await getCurrentUserRole();
  if (!userId || role !== "admin") {
    throw new Error("Unauthorized: admin role required");
  }
  return userId;
}
