"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, Plus, Loader2 } from "lucide-react";

import type {
  OutfitSuggestionResponse,
  ResolvedOutfit,
  OutfitItem,
} from "@/lib/styling/schema";
import { useCartStore } from "@/lib/store/cart";

function priceOf(item: OutfitItem) {
  return item.discountPercentage
    ? item.price * (1 - item.discountPercentage / 100)
    : item.price;
}

function ItemCard({ item }: { item: OutfitItem }) {
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const finalPrice = priceOf(item);

  return (
    <div className="group relative w-40 shrink-0">
      <Link href={`/product/${item.id}`} className="block">
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        </div>
        <p className="mt-2 text-xs font-medium line-clamp-2 leading-snug">
          {item.name}
        </p>
        <p className="mt-1 text-sm font-bold">${finalPrice.toFixed(2)}</p>
      </Link>
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
        className="mt-2 w-full flex items-center justify-center gap-1 border border-black bg-white py-2 text-[11px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
      >
        <Plus className="w-3 h-3" /> Thêm
      </button>
    </div>
  );
}

function OutfitBlock({ outfit }: { outfit: ResolvedOutfit }) {
  return (
    <div className="border border-gray-200 p-5">
      <div className="flex items-baseline justify-between mb-1">
        <h3 className="text-base font-bold uppercase tracking-wide">
          {outfit.title}
        </h3>
        <span className="text-xs text-gray-500 uppercase tracking-wider">
          {outfit.occasion}
        </span>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        {outfit.rationale}
      </p>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {outfit.items.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

export default function CompleteTheLook({ productId }: { productId: string }) {
  const [outfits, setOutfits] = useState<ResolvedOutfit[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/outfit-suggestion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("request failed");
        return res.json() as Promise<OutfitSuggestionResponse>;
      })
      .then((data) => {
        if (cancelled) return;
        setOutfits(data.outfits);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [productId]);

  // Hide the whole section when there is nothing useful to show.
  if (error) return null;
  if (!loading && (!outfits || outfits.length === 0)) return null;

  return (
    <section className="container mx-auto px-4 pb-20">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-[#FF6F61]" />
        <h2 className="text-xl font-bold uppercase tracking-widest">
          Phối cùng — Gợi ý từ AI Stylist
        </h2>
      </div>

      {loading ? (
        <div>
          <div className="flex items-center gap-2 mb-5 text-sm text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin text-[#FF6F61]" />
            <span>AI Stylist đang phối đồ cho bạn…</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {[0, 1].map((i) => (
              <div key={i} className="border border-gray-200 p-5">
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-3" />
                <div className="h-3 w-full bg-gray-100 rounded animate-pulse mb-2" />
                <div className="h-3 w-2/3 bg-gray-100 rounded animate-pulse mb-5" />
                <div className="flex gap-4">
                  {[0, 1, 2].map((j) => (
                    <div key={j} className="w-40 shrink-0">
                      <div className="aspect-[3/4] w-full bg-gray-100 animate-pulse" />
                      <div className="h-3 w-3/4 bg-gray-100 rounded animate-pulse mt-2" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          {outfits!.map((outfit, i) => (
            <OutfitBlock key={i} outfit={outfit} />
          ))}
        </div>
      )}
    </section>
  );
}
