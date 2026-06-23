import { createServerSupabase } from "@/lib/supabase/server";

export interface LiveMessage {
  id: string;
  sessionId: string;
  userId: string | null;
  userName: string;
  content: string;
  createdAt: string;
}

export interface LiveMessageRow {
  id: string;
  session_id: string;
  user_id: string | null;
  user_name: string;
  content: string;
  created_at: string;
}

export function mapRowToLiveMessage(row: LiveMessageRow): LiveMessage {
  return {
    id: row.id,
    sessionId: row.session_id,
    userId: row.user_id,
    userName: row.user_name,
    content: row.content,
    createdAt: row.created_at,
  };
}

export async function getMessagesBySession(
  sessionId: string,
  limit = 50,
): Promise<LiveMessage[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("live_messages")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true })
    .limit(limit);
  if (error) throw new Error(`getMessagesBySession: ${error.message}`);
  return (data as LiveMessageRow[]).map(mapRowToLiveMessage);
}

export interface CreateLiveMessagePayload {
  sessionId: string;
  userId: string;
  userName: string;
  content: string;
}

export async function createLiveMessage(
  payload: CreateLiveMessagePayload,
): Promise<void> {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("live_messages").insert({
    session_id: payload.sessionId,
    user_id: payload.userId,
    user_name: payload.userName,
    content: payload.content,
  });
  if (error) throw new Error(`createLiveMessage: ${error.message}`);
}
