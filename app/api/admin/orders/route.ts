import { NextRequest, NextResponse } from "next/server";
import { getAllOrdersForAdmin } from "@/lib/db/orders";
import { getCurrentUserRole } from "@/lib/auth/isAdmin";

export async function GET(req: NextRequest) {
  const { role } = await getCurrentUserRole();
  if (role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const status = req.nextUrl.searchParams.get("status") ?? undefined;
  const orders = await getAllOrdersForAdmin(status ?? undefined);
  return NextResponse.json(orders);
}
