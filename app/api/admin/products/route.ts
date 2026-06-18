import { NextResponse } from "next/server";
import { getAllProductsForAdmin } from "@/lib/db/products";
import { getCurrentUserRole } from "@/lib/auth/isAdmin";

export async function GET() {
  const { role } = await getCurrentUserRole();
  if (role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const products = await getAllProductsForAdmin();
  return NextResponse.json(products);
}
