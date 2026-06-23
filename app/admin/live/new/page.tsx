import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { getAllProductsForAdmin } from "@/lib/db/products";
import { createLiveSessionAction } from "@/lib/actions/liveSessions";
import LiveSessionForm from "@/components/admin/LiveSessionForm";
import type { ProductSummary } from "@/components/styling/MixMatchBuilder";
import type { Product } from "@/lib/types/product";

function toSummary(p: Product): ProductSummary {
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    discountPercentage: p.discountPercentage,
    image: p.images[0] ?? "",
  };
}

interface Props {
  searchParams: Promise<{ error?: string }>;
}

export default async function NewLivePage({ searchParams }: Props) {
  const { error } = await searchParams;
  const products = await getAllProductsForAdmin();

  async function handleCreate(formData: FormData) {
    "use server";
    await createLiveSessionAction(formData);
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      <div className="mb-8">
        <Link
          href="/admin/live"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors font-medium mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Tạo phiên live</h1>
        <p className="text-slate-500 mt-1">Thiết lập livestream và ghim sản phẩm bán</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/60 p-6 sm:p-8 shadow-sm">
        <LiveSessionForm
          action={handleCreate}
          products={products.map(toSummary)}
          error={error}
          isEdit={false}
        />
      </div>
    </div>
  );
}
