# SP0 — Nền dữ liệu Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Chuyển nguồn catalog từ file tĩnh `app/data/products.ts` sang Supabase mà không đổi UI hay try-on.

**Architecture:** Supabase thuần (JS client, không Prisma). Bảng `products` mirror type `Product` hiện tại với `try_on` JSONB. Trang home + product chuyển thành async Server Component đọc qua `lib/db/products.ts`. Seed bằng Node script với service role key.

**Tech Stack:** Next.js 15 (App Router, Server Components), `@supabase/supabase-js`, Supabase Postgres + RLS, Vitest (cho unit test mapper), TypeScript.

Spec: `docs/superpowers/specs/2026-06-16-sp0-data-foundation-design.md`

---

## Bước thủ công (ngoài code) — làm trước Task 4

Tạo project trên https://supabase.com, lấy 3 giá trị từ Project Settings → API:
- Project URL → `NEXT_PUBLIC_SUPABASE_URL`
- `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

Chạy SQL ở Task 3 trong Supabase SQL Editor.

---

## File Structure

- Create `lib/types/product.ts` — nguồn type duy nhất (`Product`, `TryOnConfig`, `SizeChartEntry`).
- Create `lib/supabase/server.ts` — Supabase server client (anon key, đọc).
- Create `lib/supabase/client.ts` — Supabase browser client (chuẩn bị cho SP sau).
- Create `lib/db/products.ts` — `getAllProducts`, `getProductById`, `mapRowToProduct`.
- Create `lib/db/products.test.ts` — unit test cho `mapRowToProduct`.
- Create `scripts/seed-products.ts` — seed 4 SP bằng service role.
- Create `supabase/schema.sql` — DDL + RLS (để lưu lại, chạy thủ công).
- Modify `app/data/products.ts` — import type từ `lib/types/product.ts`.
- Modify `app/page.tsx` (+ section component lấy danh sách) — fetch từ DB.
- Modify `app/product/[id]/page.tsx` — fetch từ DB + `notFound()`.
- Modify `.env.local.example`, `package.json`.

---

### Task 1: Tách type ra `lib/types/product.ts`

**Files:**
- Create: `lib/types/product.ts`
- Modify: `app/data/products.ts:1-39`

- [ ] **Step 1: Tạo file type**

Copy nguyên các interface từ đầu `app/data/products.ts` vào file mới:

```ts
// lib/types/product.ts
export interface SizeChartEntry {
  size: string;
  chestCm: [number, number];
  waistCm: [number, number];
  hipsCm?: [number, number];
  lengthCm?: number;
}

export interface TryOnConfig {
  arOverlay?: {
    src: string;
    widthMultiplier?: number;
    aspectRatio?: number;
    verticalOffsetRatio?: number;
  };
  model3D?: {
    src: string;
    meshNodeNames: string[];
    baseScale: number;
    positionOffset?: [number, number, number];
  };
  sizing?: {
    fit: "slim-fit" | "regular" | "oversized";
    sizeChart: SizeChartEntry[];
  };
}

export interface Product {
  id: string;
  name: string;
  price: number;
  discountPercentage: number | null;
  description: string;
  images: string[];
  colors: { name: string; hex: string }[];
  sizes: string[];
  reviews: { rating: number; count: number };
  tryOn?: TryOnConfig;
}
```

- [ ] **Step 2: Cập nhật `app/data/products.ts` để re-export type**

Thay block interface ở đầu file (dòng 1–39) bằng:

```ts
import type { Product, TryOnConfig, SizeChartEntry } from "@/lib/types/product";
export type { Product, TryOnConfig, SizeChartEntry };
```

Giữ nguyên `export const products: Product[] = [...]` phía dưới.

- [ ] **Step 3: Verify build typecheck**

Run: `npx tsc --noEmit`
Expected: không lỗi (mọi import `Product` cũ vẫn hợp lệ qua re-export).

- [ ] **Step 4: Commit**

```bash
git add lib/types/product.ts app/data/products.ts
git commit -m "refactor: tach Product types ra lib/types/product.ts"
```

---

### Task 2: Cài Vitest + unit test cho mapper (TDD)

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `lib/db/products.test.ts`
- Create: `lib/db/products.ts` (chỉ phần `mapRowToProduct` + type `ProductRow`)

- [ ] **Step 1: Cài Vitest**

Run: `npm i -D vitest`

- [ ] **Step 2: Tạo vitest config**

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: { environment: "node" },
  resolve: { alias: { "@": path.resolve(__dirname, ".") } },
});
```

- [ ] **Step 3: Thêm script test vào `package.json`**

Trong `"scripts"` thêm: `"test": "vitest run"` và `"test:watch": "vitest"`.

- [ ] **Step 4: Viết failing test cho `mapRowToProduct`**

```ts
// lib/db/products.test.ts
import { describe, it, expect } from "vitest";
import { mapRowToProduct, type ProductRow } from "@/lib/db/products";

const row: ProductRow = {
  id: "11111111-1111-1111-1111-111111111111",
  name: "Test Jacket",
  description: "desc",
  price: "95",
  discount_percentage: 20,
  images: ["/images/a.jpg"],
  colors: [{ name: "Black", hex: "#000000" }],
  sizes: ["S", "M"],
  reviews: { rating: 4.8, count: 110 },
  try_on: { sizing: { fit: "regular", sizeChart: [] } },
  is_active: true,
  created_at: "2026-06-16T00:00:00Z",
};

describe("mapRowToProduct", () => {
  it("maps snake_case row to Product and coerces price to number", () => {
    const p = mapRowToProduct(row);
    expect(p.id).toBe(row.id);
    expect(p.price).toBe(95);
    expect(typeof p.price).toBe("number");
    expect(p.discountPercentage).toBe(20);
    expect(p.tryOn?.sizing?.fit).toBe("regular");
  });

  it("maps null discount and missing try_on", () => {
    const p = mapRowToProduct({ ...row, discount_percentage: null, try_on: null });
    expect(p.discountPercentage).toBeNull();
    expect(p.tryOn).toBeUndefined();
  });
});
```

- [ ] **Step 5: Run test, xác nhận FAIL**

Run: `npm test`
Expected: FAIL — `mapRowToProduct` chưa tồn tại.

- [ ] **Step 6: Viết minimal implementation**

```ts
// lib/db/products.ts
import type { Product, TryOnConfig } from "@/lib/types/product";

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
  };
}
```

- [ ] **Step 7: Run test, xác nhận PASS**

Run: `npm test`
Expected: PASS (2 tests).

- [ ] **Step 8: Commit**

```bash
git add package.json vitest.config.ts lib/db/products.ts lib/db/products.test.ts
git commit -m "feat: add mapRowToProduct + vitest setup"
```

---

### Task 3: Schema SQL + RLS

**Files:**
- Create: `supabase/schema.sql`

- [ ] **Step 1: Viết file DDL**

```sql
-- supabase/schema.sql
create table if not exists products (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  description         text not null,
  price               numeric not null,
  discount_percentage int,
  images              jsonb not null default '[]',
  colors              jsonb not null default '[]',
  sizes               jsonb not null default '[]',
  reviews             jsonb not null default '{}',
  try_on              jsonb,
  is_active           boolean not null default true,
  created_at          timestamptz not null default now()
);

alter table products enable row level security;

drop policy if exists "public read active products" on products;
create policy "public read active products"
  on products for select
  using (is_active = true);
```

- [ ] **Step 2: Chạy SQL trên Supabase**

Mở Supabase Dashboard → SQL Editor → dán nội dung `supabase/schema.sql` → Run.
Expected: "Success. No rows returned". Kiểm tra Table Editor thấy bảng `products`.

- [ ] **Step 3: Commit**

```bash
git add supabase/schema.sql
git commit -m "feat: add products table schema + RLS"
```

---

### Task 4: Supabase clients + env

**Files:**
- Modify: `package.json` (cài deps)
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/client.ts`
- Modify: `.env.local.example`
- Modify: `.env.local` (không commit)

- [ ] **Step 1: Cài SDK**

Run: `npm i @supabase/supabase-js`

- [ ] **Step 2: Tạo server client**

```ts
// lib/supabase/server.ts
import { createClient } from "@supabase/supabase-js";

export function createServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  return createClient(url, anonKey, { auth: { persistSession: false } });
}
```

- [ ] **Step 3: Tạo browser client**

```ts
// lib/supabase/client.ts
import { createClient } from "@supabase/supabase-js";

export function createBrowserSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 4: Cập nhật `.env.local.example`**

Thêm dưới dòng `ANTHROPIC_API_KEY`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

- [ ] **Step 5: Điền giá trị thật vào `.env.local`** (file này đã trong `.gitignore`).

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json lib/supabase/server.ts lib/supabase/client.ts .env.local.example
git commit -m "feat: add supabase clients + env example"
```

---

### Task 5: Hàm đọc DB `getAllProducts` / `getProductById`

**Files:**
- Modify: `lib/db/products.ts`

- [ ] **Step 1: Bổ sung hàm fetch vào `lib/db/products.ts`**

Thêm vào cuối file (giữ nguyên `mapRowToProduct`, `ProductRow`):

```ts
import { createServerSupabase } from "@/lib/supabase/server";

export async function getAllProducts(): Promise<Product[]> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw new Error(`getAllProducts: ${error.message}`);
  return (data as ProductRow[]).map(mapRowToProduct);
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`getProductById: ${error.message}`);
  return data ? mapRowToProduct(data as ProductRow) : null;
}
```

(Thêm `import type { Product }` nếu chưa có ở đầu file — đã có từ Task 2.)

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: không lỗi.

- [ ] **Step 3: Run unit tests (mapper vẫn pass)**

Run: `npm test`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add lib/db/products.ts
git commit -m "feat: add getAllProducts / getProductById"
```

---

### Task 6: Seed script

**Files:**
- Create: `scripts/seed-products.ts`
- Modify: `package.json` (script + tsx dev dep)

- [ ] **Step 1: Cài tsx để chạy TS script**

Run: `npm i -D tsx dotenv`

- [ ] **Step 2: Viết seed script**

```ts
// scripts/seed-products.ts
import "dotenv/config";
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
```

- [ ] **Step 3: Thêm script vào `package.json`**

Trong `"scripts"`: `"seed": "tsx scripts/seed-products.ts"`.

- [ ] **Step 4: Chạy seed**

Run: `npm run seed`
Expected: in ra 4 dòng `<uuid>  <tên SP>`. Lưu lại 1 uuid để test Task 8.

- [ ] **Step 5: Verify trên Supabase**

Table Editor → `products`: thấy 4 dòng, cột `try_on` có JSON.

- [ ] **Step 6: Commit**

```bash
git add scripts/seed-products.ts package.json package-lock.json
git commit -m "feat: add product seed script"
```

---

### Task 7: Trang home đọc từ DB

**Files:**
- Modify: `app/page.tsx` và/hoặc section component đang import `products`

- [ ] **Step 1: Xác định nơi dùng dữ liệu**

Run: `grep -rn "from \"@/app/data/products\"\|from \"../data/products\"\|app/data/products" app components`
Ghi lại các file import mảng `products` để hiển thị danh sách (không phải import type).

- [ ] **Step 2: Chuyển nguồn dữ liệu cho home**

Trong `app/page.tsx`, đổi sang async và fetch:

```tsx
import { getAllProducts } from "@/lib/db/products";

export default async function Home() {
  const products = await getAllProducts();
  // truyền `products` xuống các section component qua props thay vì để chúng tự import mảng tĩnh
  // ...giữ nguyên phần JSX, thêm prop products cho component nào cần danh sách
}
```

Với mỗi section component đang tự import mảng tĩnh để render danh sách, đổi nó nhận `products` qua props (component có thể vẫn là Server/Client tùy hiện trạng — chỉ thay nguồn data, không thêm logic).

- [ ] **Step 3: Chạy dev và kiểm tra**

Run: `npm run dev` → mở `http://localhost:3000`
Expected: home hiển thị đủ 4 sản phẩm như trước, ảnh/giá đúng.

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: build pass.

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx components
git commit -m "feat: home reads products from Supabase"
```

---

### Task 8: Trang chi tiết sản phẩm đọc từ DB

**Files:**
- Modify: `app/product/[id]/page.tsx`

- [ ] **Step 1: Đổi nguồn dữ liệu trang product**

```tsx
import { notFound } from "next/navigation";
import { getProductById } from "@/lib/db/products";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();
  // ...giữ nguyên toàn bộ JSX + try-on dùng `product.tryOn`
}
```

(Lưu ý Next 15: `params` là Promise — `await` trước khi dùng. Điều chỉnh cho khớp signature hiện tại của file.)

- [ ] **Step 2: Test với uuid thật**

Run: `npm run dev`, mở `http://localhost:3000/product/<uuid-tu-Task-6>`
Expected: trang chi tiết hiển thị đúng; 3 tab try-on (AR / 3D / AI Size) hoạt động.

- [ ] **Step 3: Test id sai → 404**

Mở `http://localhost:3000/product/khong-ton-tai`
Expected: trang 404 của Next.

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add app/product/[id]/page.tsx
git commit -m "feat: product page reads from Supabase + 404"
```

---

### Task 9: Dọn dẹp & kiểm chứng cuối

**Files:**
- Modify: bất kỳ link nội bộ nào hardcode `/product/p1`...

- [ ] **Step 1: Tìm link hardcode id cũ**

Run: `grep -rn "/product/p[0-9]" app components`
Nếu có (vd link "xem sản phẩm" trỏ tới `p1`), sửa để dùng `product.id` động từ dữ liệu DB.

- [ ] **Step 2: Chạy full verification (Definition of Done của spec)**

- `npm run build` → pass
- Home: 4 SP từ DB
- `/product/<uuid>`: mở được, try-on chạy
- `/product/sai`: 404
- `npm test` → pass

- [ ] **Step 3: Commit nếu có sửa**

```bash
git add -A
git commit -m "chore: SP0 cleanup product links"
```

---

## Self-Review (đã kiểm)

- **Spec coverage:** schema (T3), data layer (T2/T5), clients+env (T4), seed (T6), home (T7), product page (T8), RLS (T3), kiểm chứng (T9) — phủ đủ các mục spec.
- **Placeholder:** không có TODO/“xử lý lỗi phù hợp” chung chung; mọi step có code/lệnh cụ thể.
- **Type consistency:** `ProductRow`, `mapRowToProduct`, `getAllProducts`, `getProductById` dùng nhất quán giữa các task.
- **Lưu ý còn phụ thuộc hiện trạng:** Task 7/8 cần khớp với cấu trúc JSX/props thực tế của `app/page.tsx` và `app/product/[id]/page.tsx` — người thực thi đọc file trước khi sửa.
