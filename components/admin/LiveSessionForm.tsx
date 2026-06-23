"use client";

import { useState } from "react";
import { Check } from "lucide-react";

import { SubmitButton } from "@/components/admin/SubmitButton";
import type { ProductSummary } from "@/components/styling/MixMatchBuilder";
import type { LiveSession } from "@/lib/db/liveSessions";

const PLATFORMS = [
  { value: "youtube", label: "YouTube" },
  { value: "facebook", label: "Facebook" },
  { value: "tiktok", label: "TikTok" },
] as const;

const STATUSES = [
  { value: "scheduled", label: "Sắp diễn ra" },
  { value: "live", label: "Đang live" },
  { value: "ended", label: "Đã kết thúc" },
] as const;

const inputCls =
  "w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-500";

export default function LiveSessionForm({
  action,
  products,
  initial,
  error,
  isEdit,
}: {
  action: (formData: FormData) => Promise<void>;
  products: ProductSummary[];
  initial?: LiveSession;
  error?: string;
  isEdit: boolean;
}) {
  const [pinned, setPinned] = useState<string[]>(initial?.pinnedProductIds ?? []);

  function toggle(id: string) {
    setPinned((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  return (
    <form action={action} className="flex flex-col gap-6">
      {error && (
        <p className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Tiêu đề *</label>
        <input name="title" defaultValue={initial?.title ?? ""} className={inputCls} required />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Mô tả</label>
        <textarea
          name="description"
          defaultValue={initial?.description ?? ""}
          rows={2}
          className={inputCls}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Host</label>
          <input name="hostName" defaultValue={initial?.hostName ?? ""} className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Nền tảng</label>
          <select name="platform" defaultValue={initial?.platform ?? "youtube"} className={inputCls}>
            {PLATFORMS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Link video / live *
        </label>
        <input
          name="videoUrl"
          defaultValue={initial?.videoUrl ?? ""}
          placeholder="https://www.youtube.com/watch?v=…  hoặc link Facebook/TikTok live"
          className={inputCls}
          required
        />
        <p className="text-xs text-slate-400 mt-1">
          YouTube/Facebook: dán link gốc. TikTok: dán link nhúng (embed) của phiên live.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Trạng thái</label>
        <select name="status" defaultValue={initial?.status ?? "scheduled"} className={inputCls}>
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Ghim sản phẩm ({pinned.length})
        </label>
        {/* Hidden inputs carry the selection into the server action. */}
        {pinned.map((id) => (
          <input key={id} type="hidden" name="pinnedProductIds" value={id} />
        ))}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-80 overflow-y-auto p-1">
          {products.map((p) => {
            const active = pinned.includes(p.id);
            return (
              <button
                type="button"
                key={p.id}
                onClick={() => toggle(p.id)}
                className={`text-left border rounded-xl overflow-hidden transition-colors ${
                  active ? "border-indigo-500 ring-1 ring-indigo-500" : "border-slate-200 hover:border-slate-400"
                }`}
              >
                <div className="relative aspect-[3/4] bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  {active && (
                    <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>
                <p className="text-[11px] p-1.5 line-clamp-1">{p.name}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <SubmitButton isEdit={isEdit} />
      </div>
    </form>
  );
}
