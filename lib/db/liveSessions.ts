import { createServerSupabase } from "@/lib/supabase/server";

export type LivePlatform = "youtube" | "facebook" | "tiktok";
export type LiveStatus = "scheduled" | "live" | "ended";

export interface LiveSession {
  id: string;
  title: string;
  description: string | null;
  hostName: string | null;
  platform: LivePlatform;
  videoUrl: string;
  status: LiveStatus;
  pinnedProductIds: string[];
  createdAt: string;
}

export interface LiveSessionRow {
  id: string;
  title: string;
  description: string | null;
  host_name: string | null;
  platform: LivePlatform;
  video_url: string;
  status: LiveStatus;
  pinned_product_ids: string[];
  created_at: string;
}

export function mapRowToLiveSession(row: LiveSessionRow): LiveSession {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    hostName: row.host_name,
    platform: row.platform,
    videoUrl: row.video_url,
    status: row.status,
    pinnedProductIds: row.pinned_product_ids ?? [],
    createdAt: row.created_at,
  };
}

export interface LiveSessionInput {
  title: string;
  description: string | null;
  hostName: string | null;
  platform: LivePlatform;
  videoUrl: string;
  status: LiveStatus;
  pinnedProductIds: string[];
}

export async function getAllLiveSessions(): Promise<LiveSession[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("live_sessions")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`getAllLiveSessions: ${error.message}`);
  return (data as LiveSessionRow[]).map(mapRowToLiveSession);
}

// Sessions a customer should see: live first, then scheduled. Ended hidden.
export async function getVisibleLiveSessions(): Promise<LiveSession[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("live_sessions")
    .select("*")
    .in("status", ["live", "scheduled"])
    .order("created_at", { ascending: false });
  if (error) throw new Error(`getVisibleLiveSessions: ${error.message}`);
  const sessions = (data as LiveSessionRow[]).map(mapRowToLiveSession);
  const rank: Record<LiveStatus, number> = { live: 0, scheduled: 1, ended: 2 };
  return sessions.sort((a, b) => rank[a.status] - rank[b.status]);
}

export async function getLiveSessionById(id: string): Promise<LiveSession | null> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("live_sessions")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`getLiveSessionById: ${error.message}`);
  return data ? mapRowToLiveSession(data as LiveSessionRow) : null;
}

function toRow(input: LiveSessionInput) {
  return {
    title: input.title,
    description: input.description,
    host_name: input.hostName,
    platform: input.platform,
    video_url: input.videoUrl,
    status: input.status,
    pinned_product_ids: input.pinnedProductIds,
  };
}

export async function createLiveSession(input: LiveSessionInput): Promise<{ id: string }> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("live_sessions")
    .insert(toRow(input))
    .select("id")
    .single();
  if (error) throw new Error(`createLiveSession: ${error.message}`);
  return { id: data.id };
}

export async function updateLiveSession(
  id: string,
  input: LiveSessionInput,
): Promise<void> {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("live_sessions").update(toRow(input)).eq("id", id);
  if (error) throw new Error(`updateLiveSession: ${error.message}`);
}

export async function deleteLiveSession(id: string): Promise<void> {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("live_sessions").delete().eq("id", id);
  if (error) throw new Error(`deleteLiveSession: ${error.message}`);
}
