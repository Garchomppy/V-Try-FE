import type { CartItem } from "@/lib/store/cart";
import { createServerSupabase } from "@/lib/supabase/server";
import { cartTotal } from "@/lib/store/cart";

export interface CreateOrderPayload {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  note?: string;
  items: CartItem[];
}

export function buildOrderRow(payload: CreateOrderPayload) {
  return {
    customer_name: payload.customerName,
    customer_phone: payload.customerPhone,
    customer_address: payload.customerAddress,
    ...(payload.note ? { note: payload.note } : {}),
    items: payload.items,
    subtotal: cartTotal(payload.items),
    status: "pending" as const,
  };
}

export async function createOrder(payload: CreateOrderPayload): Promise<{ id: string }> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("orders")
    .insert(buildOrderRow(payload))
    .select("id")
    .single();
  if (error) throw new Error(`createOrder: ${error.message}`);
  return { id: data.id };
}
