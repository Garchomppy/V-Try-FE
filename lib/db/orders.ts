import type { CartItem } from "@/lib/store/cart";
import { createServerSupabase } from "@/lib/supabase/server";
import { cartTotal } from "@/lib/store/cart";

export interface CreateOrderPayload {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  note?: string;
  items: CartItem[];
  userId?: string;
}

export interface OrderRow {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  note: string | null;
  items: CartItem[];
  subtotal: number;
  status: string;
  user_id: string | null;
  created_at: string;
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
    user_id: payload.userId ?? null,
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

export async function getOrdersByUserId(userId: string): Promise<OrderRow[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`getOrdersByUserId: ${error.message}`);
  return data as OrderRow[];
}

export async function getAllOrdersForAdmin(status?: string): Promise<OrderRow[]> {
  const supabase = await createServerSupabase();
  let query = supabase.from("orders").select("*").order("created_at", { ascending: false });
  if (status && status !== "all") {
    query = query.eq("status", status);
  }
  const { data, error } = await query;
  if (error) throw new Error(`getAllOrdersForAdmin: ${error.message}`);
  return data as OrderRow[];
}
