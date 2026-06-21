import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getPromotionById, getPromotionProducts } from "@/lib/db/promotions";
import { getAllProductsForAdmin } from "@/lib/db/products";
import { updatePromotionAction } from "@/lib/actions/promotions";
import PromotionForm from "@/components/admin/PromotionForm";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}

export default async function EditPromotionPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { error } = await searchParams;

  const promotion = await getPromotionById(id);
  if (!promotion) {
    redirect("/admin/promotions");
  }

  const products = await getAllProductsForAdmin();
  const selectedProductIds = await getPromotionProducts(id);

  async function handleUpdate(formData: FormData, selectedProductIds: string[]) {
    "use server";
    await updatePromotionAction(id, formData, selectedProductIds);
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
          Chỉnh sửa chương trình khuyến mãi
        </h1>
        <p className="text-slate-500 mt-1">
          Cập nhật thông tin chi tiết chương trình khuyến mãi và điều chỉnh danh sách sản phẩm áp dụng
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/60 p-6 sm:p-8 shadow-sm">
        <PromotionForm
          action={handleUpdate}
          promotion={promotion}
          products={products}
          initialSelectedProductIds={selectedProductIds}
          error={error}
        />
      </div>
    </div>
  );
}
