"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Send } from "lucide-react";

import { createBrowserSupabase } from "@/lib/supabase/client";
import { sendLiveMessage } from "@/lib/actions/liveMessages";
import type { LiveMessage, LiveMessageRow } from "@/lib/db/liveMessages";

function rowToMessage(row: LiveMessageRow): LiveMessage {
  return {
    id: row.id,
    sessionId: row.session_id,
    userId: row.user_id,
    userName: row.user_name,
    content: row.content,
    createdAt: row.created_at,
  };
}

export default function LiveChat({
  sessionId,
  initialMessages,
  isAuthed,
}: {
  sessionId: string;
  initialMessages: LiveMessage[];
  isAuthed: boolean;
}) {
  const [messages, setMessages] = useState<LiveMessage[]>(initialMessages);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Realtime: append new messages as they arrive.
  useEffect(() => {
    const supabase = createBrowserSupabase();
    const channel = supabase
      .channel(`live-chat-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "live_messages",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          const msg = rowToMessage(payload.new as LiveMessageRow);
          setMessages((prev) =>
            prev.some((m) => m.id === msg.id) ? prev : [...prev, msg],
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  // Keep the view pinned to the latest message.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  function handleSend() {
    const content = text.trim();
    if (!content) return;
    setError(null);
    startTransition(async () => {
      const res = await sendLiveMessage(sessionId, content);
      if (res.ok) setText("");
      else setError(res.error ?? "Không gửi được tin nhắn.");
    });
  }

  return (
    <div className="flex flex-col border border-gray-200 h-[28rem]">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {messages.length === 0 ? (
          <p className="text-sm text-gray-400 m-auto">
            Chưa có bình luận. Hãy là người đầu tiên!
          </p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="text-sm">
              <span className="font-bold text-gray-800">{m.userName}</span>{" "}
              <span className="text-gray-600">{m.content}</span>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-gray-200 p-2">
        {isAuthed ? (
          <div className="flex items-center gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
              maxLength={300}
              placeholder="Nhập bình luận…"
              className="flex-1 border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
            />
            <button
              onClick={handleSend}
              disabled={pending || !text.trim()}
              className="shrink-0 bg-black text-white p-2.5 hover:bg-gray-900 transition-colors disabled:opacity-40"
              aria-label="Gửi"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="block text-center border border-black py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors"
          >
            Đăng nhập để bình luận
          </Link>
        )}
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      </div>
    </div>
  );
}
