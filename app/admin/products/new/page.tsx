import ProductForm from "@/components/admin/ProductForm";
import { createProduct } from "@/lib/actions/products";

interface Props {
  searchParams: Promise<{ error?: string }>;
}

export default async function NewProductPage({ searchParams }: Props) {
  const { error } = await searchParams;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Thêm sản phẩm mới</h1>
      <ProductForm action={createProduct} error={error} />
    </div>
  );
}
