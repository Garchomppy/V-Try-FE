import Link from "next/link";
import { notFound } from "next/navigation";
import { Sparkles } from "lucide-react";

import { getLookById } from "@/lib/db/looks";
import { getAllProducts } from "@/lib/db/products";
import type { Product } from "@/lib/types/product";

export const dynamic = "force-dynamic";

function priceOf(p: Product) {
  return p.discountPercentage ? p.price * (1 - p.discountPercentage / 100) : p.price;
}

export default async function SharedLookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const look = await getLookById(id);
  if (!look) notFound();

  const catalog = await getAllProducts();
  const byId = new Map(catalog.map((p) => [p.id, p]));
  const items = look.itemProductIds
    .map((pid) => byId.get(pid))
    .filter((p): p is Product => Boolean(p));

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-6 h-6 text-[#FF6F61]" />
        <h1 className="text-2xl font-bold uppercase tracking-widest">{look.name}</h1>
      </div>
      <p className="text-sm text-gray-500 mb-10">Một look được phối trên V-Try.</p>

      {items.length === 0 ? (
        <p className="text-gray-400">Các sản phẩm trong look này không còn khả dụng.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {items.map((p) => (
            <Link key={p.id} href={`/product/${p.id}`} className="group block">
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.images[0]}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <p className="mt-2 text-sm font-medium line-clamp-1">{p.name}</p>
              <p className="text-sm font-bold">${priceOf(p).toFixed(2)}</p>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-12">
        <Link
          href="/styling"
          className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-gray-900 transition-colors"
        >
          Tự phối look của bạn
        </Link>
      </div>
    </div>
  );
}
