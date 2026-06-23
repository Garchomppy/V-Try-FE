"use client";

import { useState, useTransition } from "react";
import { Trash2, Share2, Loader2 } from "lucide-react";

import { deleteLook } from "@/lib/actions/looks";
import type { ProductSummary } from "./MixMatchBuilder";

export interface SavedLook {
  id: string;
  name: string;
  items: ProductSummary[];
}

function LookCard({ look }: { look: SavedLook }) {
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  function handleShare() {
    const url = `${window.location.origin}/looks/${look.id}`;
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold uppercase tracking-wide line-clamp-1">
          {look.name}
        </h3>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleShare}
            className="p-1.5 text-gray-400 hover:text-black"
            aria-label="Chia sẻ"
            title={copied ? "Đã copy link!" : "Copy link chia sẻ"}
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={() =>
              startTransition(async () => {
                await deleteLook(look.id);
              })
            }
            disabled={pending}
            className="p-1.5 text-gray-400 hover:text-red-600 disabled:opacity-40"
            aria-label="Xóa"
          >
            {pending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto">
        {look.items.map((p) => (
          <div key={p.id} className="w-20 shrink-0">
            <div className="aspect-[3/4] w-full overflow-hidden bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
            </div>
          </div>
        ))}
      </div>
      {copied && <p className="mt-2 text-xs text-green-600">Đã copy link chia sẻ!</p>}
    </div>
  );
}

export default function SavedLooks({ looks }: { looks: SavedLook[] }) {
  if (looks.length === 0) return null;
  return (
    <div>
      <h2 className="text-sm font-bold uppercase tracking-widest mb-4 text-gray-700">
        Look đã lưu của bạn
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {looks.map((look) => (
          <LookCard key={look.id} look={look} />
        ))}
      </div>
    </div>
  );
}
