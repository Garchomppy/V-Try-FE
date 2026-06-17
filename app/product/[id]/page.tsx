import { notFound } from "next/navigation";

import { getProductById } from "@/lib/db/products";
import ProductDetailClient from "@/components/product/ProductDetailClient";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  return <ProductDetailClient product={product} />;
}
