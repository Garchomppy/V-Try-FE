"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { getProfile } from "@/lib/db/profiles";
import { createLiveMessage } from "@/lib/db/liveMessages";

export interface SendMessageResult {
  ok: boolean;
  error?: string;
}

export async function sendLiveMessage(
  sessionId: string,
  content: string,
): Promise<SendMessageResult> {
  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { ok: false, error: "Bạn cần đăng nhập để bình luận." };

  const text = content.trim();
  if (!text) return { ok: false, error: "Nội dung trống." };
  if (text.length > 300) return { ok: false, error: "Tin nhắn quá dài (tối đa 300 ký tự)." };

  const profile = await getProfile(data.user.id);
  const userName =
    profile?.fullName?.trim() || data.user.email?.split("@")[0] || "Khách";

  await createLiveMessage({
    sessionId,
    userId: data.user.id,
    userName,
    content: text,
  });

  return { ok: true };
}
