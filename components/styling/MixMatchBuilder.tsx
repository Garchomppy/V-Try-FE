"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Plus, X, Check, Loader2, LogIn } from "lucide-react";

import { saveLook } from "@/lib/actions/looks";

export interface ProductSummary {
  id: string;
  name: string;
  price: number;
  discountPercentage: number | null;
  image: string;
}

function priceOf(p: ProductSummary) {
  return p.discountPercentage ? p.price * (1 - p.discountPercentage / 100) : p.price;
}

export default function MixMatchBuilder({
  catalog,
  isAuthed,
}: {
  catalog: ProductSummary[];
  isAuthed: boolean;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const byId = useMemo(
    () => new Map(catalog.map((p) => [p.id, p])),
    [catalog],
  );
  const selectedItems = selected
    .map((id) => byId.get(id))
    .filter((p): p is ProductSummary => Boolean(p));

  function toggle(id: string) {
    setMessage(null);
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function handleSave() {
    setMessage(null);
    startTransition(async () => {
      const res = await saveLook(name, selected);
      if (res.ok) {
        setMessage({ type: "ok", text: "Đã lưu look vào bộ sưu tập của bạn!" });
        setSelected([]);
        setName("");
      } else {
        setMessage({ type: "err", text: res.error ?? "Có lỗi xảy ra." });
      }
    });
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Catalog picker */}
      <div className="lg:col-span-2">
        <h2 className="text-sm font-bold uppercase tracking-widest mb-4 text-gray-700">
          Chọn món để phối
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {catalog.map((p) => {
            const active = selected.includes(p.id);
            return (
              <button
                key={p.id}
                onClick={() => toggle(p.id)}
                className={`group text-left border transition-colors ${
                  active ? "border-[#FF6F61] ring-1 ring-[#FF6F61]" : "border-gray-200 hover:border-black"
                }`}
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  <div
                    className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center ${
                      active ? "bg-[#FF6F61] text-white" : "bg-white/80 text-gray-400"
                    }`}
                  >
                    {active ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  </div>
                </div>
                <div className="p-2">
                  <p className="text-xs font-medium line-clamp-1">{p.name}</p>
                  <p className="text-xs font-bold mt-0.5">${priceOf(p).toFixed(2)}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Current look panel */}
      <div className="lg:col-span-1">
        <div className="border border-gray-200 p-5 lg:sticky lg:top-24">
          <h2 className="text-sm font-bold uppercase tracking-widest mb-4 text-gray-700">
            Look của bạn ({selectedItems.length})
          </h2>

          {selectedItems.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">
              Chọn ít nhất 2 món từ bên trái để tạo một look.
            </p>
          ) : (
            <div className="flex flex-col gap-2 mb-4">
              {selectedItems.map((p) => (
                <div key={p.id} className="flex items-center gap-3">
                  <div className="w-12 h-16 shrink-0 overflow-hidden bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <p className="text-xs flex-1 line-clamp-2">{p.name}</p>
                  <button
                    onClick={() => toggle(p.id)}
                    className="p-1 text-gray-400 hover:text-black"
                    aria-label="Bỏ khỏi look"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tên look (vd: Dạo phố cuối tuần)"
            className="w-full border border-gray-300 px-3 py-2.5 text-sm mb-3 focus:border-black outline-none"
          />

          {isAuthed ? (
            <button
              onClick={handleSave}
              disabled={pending || selectedItems.length < 2 || !name.trim()}
              className="w-full flex items-center justify-center gap-2 bg-black text-white py-3 text-xs font-bold uppercase tracking-widest hover:bg-gray-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Lưu look
            </button>
          ) : (
            <Link
              href="/login"
              className="w-full flex items-center justify-center gap-2 border border-black py-3 text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors"
            >
              <LogIn className="w-4 h-4" /> Đăng nhập để lưu
            </Link>
          )}

          {message && (
            <p
              className={`mt-3 text-xs ${message.type === "ok" ? "text-green-600" : "text-red-600"}`}
            >
              {message.text}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
