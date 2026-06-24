import { Sparkles } from "lucide-react";

import { createServerSupabase } from "@/lib/supabase/server";
import { getAllProducts } from "@/lib/db/products";
import { getLooksByUserId } from "@/lib/db/looks";
import type { Product } from "@/lib/types/product";
import MixMatchBuilder, {
  type ProductSummary,
} from "@/components/styling/MixMatchBuilder";
import SavedLooks, { type SavedLook } from "@/components/styling/SavedLooks";

export const dynamic = "force-dynamic";

function toSummary(p: Product): ProductSummary {
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    discountPercentage: p.discountPercentage,
    image: p.images[0] ?? "",
  };
}

export default async function StylingPage() {
  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  const catalog = await getAllProducts();
  const summaries = catalog.map(toSummary);
  const byId = new Map(summaries.map((p) => [p.id, p]));

  let savedLooks: SavedLook[] = [];
  if (user) {
    const looks = await getLooksByUserId(user.id);
    savedLooks = looks.map((l) => ({
      id: l.id,
      name: l.name,
      items: l.itemProductIds
        .map((id) => byId.get(id))
        .filter((p): p is ProductSummary => Boolean(p)),
    }));
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-6 h-6 text-[#FF6F61]" />
        <h1 className="text-2xl font-bold uppercase tracking-widest">
          Mix &amp; Match — Phối đồ theo cách của bạn
        </h1>
      </div>
      <p className="text-sm text-gray-500 mb-10">
        Chọn các món yêu thích, ghép thành một look hoàn chỉnh và lưu lại để chia sẻ.
      </p>

      <MixMatchBuilder catalog={summaries} isAuthed={Boolean(user)} />

      {savedLooks.length > 0 && (
        <div className="mt-16">
          <SavedLooks looks={savedLooks} />
        </div>
      )}
    </div>
  );
}
