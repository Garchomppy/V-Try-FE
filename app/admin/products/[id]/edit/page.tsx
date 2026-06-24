import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { getProductById } from "@/lib/db/products";
import { updateProduct } from "@/lib/actions/products";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}

export default async function EditProductPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { error } = await searchParams;

  const product = await getProductById(id);
  if (!product) notFound();

  // Bind the id so ProductForm can call: action(formData) → updateProduct(id, formData)
  const updateWithId = updateProduct.bind(null, id);

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
         <h1 className="text-3xl font-bold tracking-tight text-slate-900">Sửa sản phẩm</h1>
         <p className="text-slate-500 mt-1">Cập nhật thông tin chi tiết của sản phẩm.</p>
      </div>
      <div className="bg-white p-8 rounded-2xl border border-slate-200/60 shadow-sm">
        <ProductForm action={updateWithId} product={product} error={error} />
      </div>
    </div>
  );
}
