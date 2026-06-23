import { notFound } from "next/navigation";

import { getProductById } from "@/lib/db/products";
import ProductDetailClient from "@/components/product/ProductDetailClient";
import CompleteTheLook from "@/components/styling/CompleteTheLook";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  return (
    <>
      <ProductDetailClient product={product} />
      <CompleteTheLook productId={product.id} />
    </>
  );
}
