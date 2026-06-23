"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Radio } from "lucide-react";

import { createBrowserSupabase } from "@/lib/supabase/client";
import { toEmbedUrl } from "@/lib/live/embed";
import { useCartStore } from "@/lib/store/cart";
import type { LivePlatform, LiveStatus } from "@/lib/db/liveSessions";
import type { ProductSummary } from "@/components/styling/MixMatchBuilder";
import type { LiveMessage } from "@/lib/db/liveMessages";
import LiveChat from "./LiveChat";

interface SessionState {
  platform: LivePlatform;
  videoUrl: string;
  status: LiveStatus;
  pinnedProductIds: string[];
}

function priceOf(p: ProductSummary) {
  return p.discountPercentage ? p.price * (1 - p.discountPercentage / 100) : p.price;
}

function StatusBadge({ status }: { status: LiveStatus }) {
  if (status === "live") {
    return (
      <span className="inline-flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded">
        <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" /> Live
      </span>
    );
  }
  if (status === "scheduled") {
    return (
      <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded">
        Sắp diễn ra
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 bg-gray-200 text-gray-600 text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded">
      Đã kết thúc
    </span>
  );
}

function PinnedCard({ item }: { item: ProductSummary }) {
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const finalPrice = priceOf(item);

  return (
    <div className="flex items-center gap-3 border border-gray-200 p-2">
      <Link href={`/product/${item.id}`} className="w-14 h-18 shrink-0">
        <div className="w-14 h-[72px] overflow-hidden bg-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        </div>
      </Link>
      <div className="flex-1 min-w-0">
        <Link href={`/product/${item.id}`} className="text-xs font-medium line-clamp-2 hover:underline">
          {item.name}
        </Link>
        <p className="text-sm font-bold mt-0.5">${finalPrice.toFixed(2)}</p>
      </div>
      <button
        onClick={() => {
          addItem({
            productId: item.id,
            name: item.name,
            price: finalPrice,
            image: item.image,
            size: "M",
            color: "#000000",
          });
          openCart();
        }}
        className="shrink-0 flex items-center gap-1 bg-black text-white px-3 py-2 text-[11px] font-bold uppercase tracking-widest hover:bg-gray-900 transition-colors"
      >
        <Plus className="w-3 h-3" /> Mua
      </button>
    </div>
  );
}

export default function LiveRoom({
  sessionId,
  initialSession,
  catalog,
  initialMessages,
  isAuthed,
}: {
  sessionId: string;
  initialSession: SessionState;
  catalog: ProductSummary[];
  initialMessages: LiveMessage[];
  isAuthed: boolean;
}) {
  const [session, setSession] = useState<SessionState>(initialSession);

  const byId = useMemo(() => new Map(catalog.map((p) => [p.id, p])), [catalog]);
  const pinnedItems = session.pinnedProductIds
    .map((id) => byId.get(id))
    .filter((p): p is ProductSummary => Boolean(p));

  // Realtime: react to admin pinning products / starting / ending the live.
  useEffect(() => {
    const supabase = createBrowserSupabase();
    const channel = supabase
      .channel(`live-session-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "live_sessions",
          filter: `id=eq.${sessionId}`,
        },
        (payload) => {
          const row = payload.new as {
            platform: LivePlatform;
            video_url: string;
            status: LiveStatus;
            pinned_product_ids: string[];
          };
          setSession({
            platform: row.platform,
            videoUrl: row.video_url,
            status: row.status,
            pinnedProductIds: row.pinned_product_ids ?? [],
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  const embedSrc = toEmbedUrl(session.platform, session.videoUrl);

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Video + pinned */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        <div className="relative aspect-video w-full bg-black overflow-hidden">
          {session.status === "ended" ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-2">
              <Radio className="w-10 h-10 opacity-40" />
              <p className="text-sm">Phiên live đã kết thúc.</p>
            </div>
          ) : embedSrc ? (
            <iframe
              src={embedSrc}
              className="absolute inset-0 w-full h-full"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              title="Live stream"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white text-sm">
              Chưa có nguồn video.
            </div>
          )}
        </div>

        {session.status !== "ended" && session.videoUrl && (
          <a
            href={session.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-500 hover:text-black underline self-start -mt-3"
          >
            Video không hiển thị? Mở trực tiếp trên {session.platform === "youtube" ? "YouTube" : session.platform === "facebook" ? "Facebook" : "TikTok"} ↗
          </a>
        )}

        <div>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-700">
              Sản phẩm trong phiên live
            </h2>
            {pinnedItems.length > 0 && (
              <span className="text-xs text-gray-400">({pinnedItems.length})</span>
            )}
          </div>
          {pinnedItems.length === 0 ? (
            <p className="text-sm text-gray-400">Chưa có sản phẩm nào được ghim.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {pinnedItems.map((item) => (
                <PinnedCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat */}
      <div className="lg:col-span-1">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-700">
            Trò chuyện trực tiếp
          </h2>
          <StatusBadge status={session.status} />
        </div>
        <LiveChat
          sessionId={sessionId}
          initialMessages={initialMessages}
          isAuthed={isAuthed}
        />
      </div>
    </div>
  );
}
