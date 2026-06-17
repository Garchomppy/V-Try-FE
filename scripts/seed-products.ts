import { config } from "dotenv";
config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";
import { products } from "../app/data/products";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!url || !serviceKey) throw new Error("Missing Supabase env for seed");

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

async function main() {
  const rows = products.map((p) => ({
    name: p.name,
    description: p.description,
    price: p.price,
    discount_percentage: p.discountPercentage,
    images: p.images,
    colors: p.colors,
    sizes: p.sizes,
    reviews: p.reviews,
    try_on: p.tryOn ?? null,
    is_active: true,
  }));
  const { data, error } = await supabase.from("products").insert(rows).select("id, name");
  if (error) throw error;
  console.log(`Seeded ${data.length} products:`);
  data.forEach((d) => console.log(`  ${d.id}  ${d.name}`));
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
