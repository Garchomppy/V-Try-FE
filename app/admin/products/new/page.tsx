import ProductForm from "@/components/admin/ProductForm";
import { createProduct } from "@/lib/actions/products";

interface Props {
  searchParams: Promise<{ error?: string }>;
}

export default async function NewProductPage({ searchParams }: Props) {
  const { error } = await searchParams;

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
         <h1 className="text-3xl font-bold tracking-tight text-slate-900">Thêm sản phẩm mới</h1>
         <p className="text-slate-500 mt-1">Điền thông tin chi tiết để tạo sản phẩm.</p>
      </div>
      <div className="bg-white p-8 rounded-2xl border border-slate-200/60 shadow-sm">
        <ProductForm action={createProduct} error={error} />
      </div>
    </div>
  );
}
