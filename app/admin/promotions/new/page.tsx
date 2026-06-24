import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAllProductsForAdmin } from "@/lib/db/products";
import { createPromotionAction } from "@/lib/actions/promotions";
import PromotionForm from "@/components/admin/PromotionForm";

interface Props {
  searchParams: Promise<{ error?: string }>;
}

export default async function NewPromotionPage({ searchParams }: Props) {
  const { error } = await searchParams;
  const products = await getAllProductsForAdmin();

  async function handleCreate(formData: FormData, selectedProductIds: string[]) {
    "use server";
    await createPromotionAction(formData, selectedProductIds);
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      <div className="mb-8">
        <Link
          href="/admin/promotions"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors font-medium mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Tạo khuyến mãi mới
        </h1>
        <p className="text-slate-500 mt-1">
          Thiết lập chương trình giảm giá và áp dụng cho danh sách sản phẩm
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/60 p-6 sm:p-8 shadow-sm">
        <PromotionForm
          action={handleCreate}
          products={products}
          error={error}
        />
      </div>
    </div>
  );
}
