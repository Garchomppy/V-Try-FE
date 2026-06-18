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
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Sửa sản phẩm</h1>
      <ProductForm action={updateWithId} product={product} error={error} />
    </div>
  );
}
