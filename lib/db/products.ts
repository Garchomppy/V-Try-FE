import type { Product, TryOnConfig } from "@/lib/types/product";
import { createServerSupabase } from "@/lib/supabase/server";

export interface ProductRow {
  id: string;
  name: string;
  description: string;
  price: number | string;
  discount_percentage: number | null;
  images: string[];
  colors: { name: string; hex: string }[];
  sizes: string[];
  reviews: { rating: number; count: number };
  try_on: TryOnConfig | null;
  is_active: boolean;
  created_at: string;
}

export function mapRowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    discountPercentage: row.discount_percentage,
    images: row.images,
    colors: row.colors,
    sizes: row.sizes,
    reviews: row.reviews,
    tryOn: row.try_on ?? undefined,
    isActive: row.is_active,
  };
}

export async function getAllProducts(): Promise<Product[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw new Error(`getAllProducts: ${error.message}`);
  return (data as ProductRow[]).map(mapRowToProduct);
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`getProductById: ${error.message}`);
  return data ? mapRowToProduct(data as ProductRow) : null;
}

export async function getAllProductsForAdmin(): Promise<Product[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw new Error(`getAllProductsForAdmin: ${error.message}`);
  return (data as ProductRow[]).map(mapRowToProduct);
}
