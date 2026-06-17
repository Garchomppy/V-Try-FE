import { NextRequest } from "next/server";
import { createOrder } from "@/lib/db/orders";
import type { CartItem } from "@/lib/store/cart";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface OrderBody {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  note?: string;
  items: CartItem[];
  subtotal: number;
}

export async function POST(req: NextRequest) {
  let body: OrderBody;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { customerName, customerPhone, customerAddress, note, items } = body;
  if (
    !customerName?.trim() ||
    !customerPhone?.trim() ||
    !customerAddress?.trim()
  ) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return Response.json({ error: "Cart is empty" }, { status: 400 });
  }

  try {
    const { id } = await createOrder({
      customerName,
      customerPhone,
      customerAddress,
      note,
      items,
    });
    return Response.json({ id });
  } catch (err) {
    console.error("[orders] createOrder failed:", (err as Error).message);
    return Response.json(
      { error: "Không thể tạo đơn hàng. Vui lòng thử lại." },
      { status: 500 },
    );
  }
}
