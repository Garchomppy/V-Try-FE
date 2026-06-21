import { createServerSupabase } from "@/lib/supabase/server";

export interface Promotion {
  id: string;
  name: string;
  description: string | null;
  discountPercentage: number;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface PromotionRow {
  id: string;
  name: string;
  description: string | null;
  discount_percentage: number;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
}

export function mapRowToPromotion(row: PromotionRow): Promotion {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    discountPercentage: row.discount_percentage,
    startDate: row.start_date,
    endDate: row.end_date,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

export async function getAllPromotions(): Promise<Promotion[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("promotions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`getAllPromotions: ${error.message}`);
  return (data as PromotionRow[]).map(mapRowToPromotion);
}

export async function getPromotionById(id: string): Promise<Promotion | null> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("promotions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`getPromotionById: ${error.message}`);
  return data ? mapRowToPromotion(data as PromotionRow) : null;
}

export async function getPromotionProducts(promotionId: string): Promise<string[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("product_promotions")
    .select("product_id")
    .eq("promotion_id", promotionId);

  if (error) throw new Error(`getPromotionProducts: ${error.message}`);
  return data.map((d: any) => d.product_id);
}

export async function validatePromotionOverlap(
  supabase: any,
  productIds: string[],
  startDate: string | null,
  endDate: string | null,
  excludePromotionId?: string
): Promise<void> {
  const { data: existingLinks, error: linkError } = await supabase
    .from("product_promotions")
    .select(`
      product_id,
      promotion:promotions (
        id,
        name,
        start_date,
        end_date,
        is_active
      )
    `)
    .in("product_id", productIds);

  if (linkError) {
    throw new Error(`Lỗi kiểm tra trùng lặp khuyến mãi: ${linkError.message}`);
  }

  if (!existingLinks || existingLinks.length === 0) return;

  const overlappingProductIds: string[] = [];
  const productToPromotionMap: Record<string, string> = {};

  const newStart = startDate ? new Date(startDate) : null;
  const newEnd = endDate ? new Date(endDate) : null;

  for (const link of existingLinks) {
    const promo = link.promotion as any;
    if (!promo) continue;
    if (!promo.is_active) continue;
    if (excludePromotionId && promo.id === excludePromotionId) continue;

    const oldStart = promo.start_date ? new Date(promo.start_date) : null;
    const oldEnd = promo.end_date ? new Date(promo.end_date) : null;

    // Check time overlap: (oldStart <= newEnd || !newEnd || !oldStart) && (oldEnd >= newStart || !newStart || !oldEnd)
    const startsBeforeOrAtNewEnd = !oldStart || !newEnd || oldStart <= newEnd;
    const endsAfterOrAtNewStart = !oldEnd || !newStart || oldEnd >= newStart;

    if (startsBeforeOrAtNewEnd && endsAfterOrAtNewStart) {
      overlappingProductIds.push(link.product_id);
      productToPromotionMap[link.product_id] = promo.name;
    }
  }

  if (overlappingProductIds.length > 0) {
    // Fetch product names for formatting
    const { data: productsData, error: prodError } = await supabase
      .from("products")
      .select("id, name")
      .in("id", overlappingProductIds);

    if (prodError) {
      throw new Error(`Lỗi lấy thông tin sản phẩm trùng lặp: ${prodError.message}`);
    }

    const promoToProducts: Record<string, string[]> = {};
    for (const prod of productsData || []) {
      const promoName = productToPromotionMap[prod.id];
      if (promoName) {
        if (!promoToProducts[promoName]) {
          promoToProducts[promoName] = [];
        }
        promoToProducts[promoName].push(prod.name);
      }
    }

    const messages: string[] = [];
    for (const [promoName, productNames] of Object.entries(promoToProducts)) {
      messages.push(
        `Các sản phẩm: [${productNames.join(", ")}] hiện đang được áp dụng trong chương trình khuyến mãi [${promoName}] trong cùng khoảng thời gian.`
      );
    }

    throw new Error(
      `Thao tác thất bại! ${messages.join(" ")} Vui lòng gỡ các sản phẩm này ra hoặc chọn khoảng thời gian khác!`
    );
  }
}

export async function createPromotion(
  promo: Omit<Promotion, "id" | "createdAt">,
  productIds: string[]
): Promise<Promotion> {
  const supabase = await createServerSupabase();

  if (promo.isActive && productIds.length > 0) {
    await validatePromotionOverlap(supabase, productIds, promo.startDate, promo.endDate);
  }

  // Insert promotion
  const { data: insertedPromo, error: promoError } = await supabase
    .from("promotions")
    .insert({
      name: promo.name,
      description: promo.description,
      discount_percentage: promo.discountPercentage,
      start_date: promo.startDate || null,
      end_date: promo.endDate || null,
      is_active: promo.isActive,
    })
    .select()
    .single();

  if (promoError) throw new Error(`createPromotion details: ${promoError.message}`);

  const promotionId = insertedPromo.id;

  // Insert product links
  if (productIds.length > 0) {
    const links = productIds.map((pId) => ({
      product_id: pId,
      promotion_id: promotionId,
    }));
    const { error: linkError } = await supabase
      .from("product_promotions")
      .insert(links);

    if (linkError) throw new Error(`createPromotion links: ${linkError.message}`);

    // Update products' discount percentage
    if (promo.isActive) {
      await supabase
        .from("products")
        .update({ discount_percentage: promo.discountPercentage })
        .in("id", productIds);
    }
  }

  return mapRowToPromotion(insertedPromo as PromotionRow);
}

export async function updatePromotion(
  id: string,
  promo: Omit<Promotion, "id" | "createdAt">,
  productIds: string[]
): Promise<Promotion> {
  const supabase = await createServerSupabase();

  if (promo.isActive && productIds.length > 0) {
    await validatePromotionOverlap(supabase, productIds, promo.startDate, promo.endDate, id);
  }

  // Get previous list of products to revert discounts if needed
  const oldProductIds = await getPromotionProducts(id);

  // Update promotion details
  const { data: updatedPromo, error: promoError } = await supabase
    .from("promotions")
    .update({
      name: promo.name,
      description: promo.description,
      discount_percentage: promo.discountPercentage,
      start_date: promo.startDate || null,
      end_date: promo.endDate || null,
      is_active: promo.isActive,
    })
    .eq("id", id)
    .select()
    .single();

  if (promoError) throw new Error(`updatePromotion details: ${promoError.message}`);

  // Delete old links
  const { error: deleteError } = await supabase
    .from("product_promotions")
    .delete()
    .eq("promotion_id", id);

  if (deleteError) throw new Error(`updatePromotion clean: ${deleteError.message}`);

  // Insert new links
  if (productIds.length > 0) {
    const links = productIds.map((pId) => ({
      product_id: pId,
      promotion_id: id,
    }));
    const { error: linkError } = await supabase
      .from("product_promotions")
      .insert(links);

    if (linkError) throw new Error(`updatePromotion links: ${linkError.message}`);
  }

  // Update discount percentages on products:
  // 1. Reset old products discount to NULL (or 0)
  if (oldProductIds.length > 0) {
    await supabase
      .from("products")
      .update({ discount_percentage: null })
      .in("id", oldProductIds);
  }

  // 2. Set new products discount if promotion is active
  if (promo.isActive && productIds.length > 0) {
    await supabase
      .from("products")
      .update({ discount_percentage: promo.discountPercentage })
      .in("id", productIds);
  }

  return mapRowToPromotion(updatedPromo as PromotionRow);
}

export async function deletePromotion(id: string): Promise<void> {
  const supabase = await createServerSupabase();

  // Get products of this promotion to reset their discount_percentage
  const productIds = await getPromotionProducts(id);

  const { error: deleteError } = await supabase
    .from("promotions")
    .delete()
    .eq("id", id);

  if (deleteError) throw new Error(`deletePromotion: ${deleteError.message}`);

  // Reset product discount_percentage
  if (productIds.length > 0) {
    await supabase
      .from("products")
      .update({ discount_percentage: null })
      .in("id", productIds);
  }
}

export async function getActivePromotionsWithProducts(): Promise<
  (Promotion & { products: any[] })[]
> {
  const supabase = await createServerSupabase();

  // 1. Fetch active promotions
  const { data: promosData, error: promoError } = await supabase
    .from("promotions")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (promoError)
    throw new Error(`getActivePromotionsWithProducts promos: ${promoError.message}`);
  const promotions = (promosData as PromotionRow[]).map(mapRowToPromotion);

  // 2. Fetch active products
  const { data: productsData, error: productsError } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true);

  if (productsError)
    throw new Error(
      `getActivePromotionsWithProducts products: ${productsError.message}`
    );

  // Dynamic import or function call to map product row to product type
  const { mapRowToProduct } = await import("./products");
  const allProducts = (productsData as any[]).map(mapRowToProduct);

  // 3. Fetch all junction links
  const { data: linksData, error: linksError } = await supabase
    .from("product_promotions")
    .select("*");

  if (linksError)
    throw new Error(`getActivePromotionsWithProducts links: ${linksError.message}`);

  // Combine
  return promotions.map((promo) => {
    const matchedProductIds = (linksData || [])
      .filter((link: any) => link.promotion_id === promo.id)
      .map((link: any) => link.product_id);

    const promoProducts = allProducts.filter((prod) =>
      matchedProductIds.includes(prod.id)
    );

    return {
      ...promo,
      products: promoProducts,
    };
  });
}
