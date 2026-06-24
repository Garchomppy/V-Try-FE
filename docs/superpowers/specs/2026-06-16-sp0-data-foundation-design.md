# SP0 — Nền dữ liệu (Supabase + migrate catalog)

> Sub-project đầu tiên của lộ trình "platform bán hàng hoàn thiện".
> Lộ trình: **SP0 (nền dữ liệu)** → SP1 (giỏ hàng + COD) → SP2 (auth + tài khoản) → SP3 (admin).

## Mục tiêu

Chuyển nguồn catalog từ file tĩnh `app/data/products.ts` sang Supabase **mà không thay đổi UI hay các tính năng try-on**. Sau SP0, trang home và trang chi tiết sản phẩm đọc dữ liệu từ DB; type `Product` giữ nguyên nên không component try-on nào phải sửa.

## Phi mục tiêu (YAGNI cho SP0)

- KHÔNG làm giỏ hàng, checkout, đơn hàng (SP1).
- KHÔNG làm auth, profiles (SP2).
- KHÔNG làm admin/CRUD, upload ảnh (SP3).
- KHÔNG tách `product_variants`/tồn kho — để SP1 khi checkout cần.
- KHÔNG đổi UI, không đổi luồng try-on, không đổi route param.

## Quyết định kiến trúc đã chốt

- **Supabase thuần** (Supabase JS client), **không Prisma**.
- **Supabase Storage** cho ảnh ở các SP sau (bỏ Cloudinary).
- **Không React Query** ở MVP — dùng Server Components fetch trực tiếp.
- Routing giữ nguyên `/product/[id]` với `id` là **uuid** (bỏ slug).

## Schema

Một bảng duy nhất cho SP0, mirror đúng type `Product` hiện tại.

```sql
create table products (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  description         text not null,
  price               numeric not null,
  discount_percentage int,
  images              jsonb not null default '[]',   -- string[]
  colors              jsonb not null default '[]',   -- [{name, hex}]
  sizes               jsonb not null default '[]',   -- string[]
  reviews             jsonb not null default '{}',   -- {rating, count}
  try_on              jsonb,                          -- TryOnConfig | null
  is_active           boolean not null default true,
  created_at          timestamptz not null default now()
);

alter table products enable row level security;

-- Đọc công khai chỉ sản phẩm đang bán
create policy "public read active products"
  on products for select
  using (is_active = true);
-- Không có policy insert/update/delete => chỉ service role ghi được (admin ở SP3).
```

## Lớp truy cập dữ liệu

- `lib/types/product.ts` — chuyển các interface `Product`, `TryOnConfig`, `SizeChartEntry` ra đây (nguồn type duy nhất). `app/data/products.ts` import lại từ đây trong giai đoạn seed.
- `lib/supabase/server.ts` — tạo Supabase server client dùng anon key (cho đọc trong Server Components).
- `lib/supabase/client.ts` — Supabase browser client (chuẩn bị cho SP sau; SP0 có thể chưa dùng).
- `lib/db/products.ts`:
  - `getAllProducts(): Promise<Product[]>`
  - `getProductById(id: string): Promise<Product | null>`
  - Hàm map row DB → `Product` (đảm bảo shape khớp 100% type cũ).

## Thay đổi trang

- `app/page.tsx` (và các section component lấy danh sách SP) → async Server Component, gọi `getAllProducts()`.
- `app/product/[id]/page.tsx` → gọi `getProductById(params.id)`; `notFound()` nếu null. Tab try-on đọc `product.tryOn` y như cũ.

## Seed dữ liệu

- `scripts/seed-products.ts` — Node script dùng `SUPABASE_SERVICE_ROLE_KEY`, đọc mảng `products` hiện có và **upsert** vào bảng `products` (map field → cột, dump `tryOn` vào `try_on`).
- Chạy một lần để nạp 4 sản phẩm demo. Sau khi xác nhận DB chạy đúng, file tĩnh có thể xóa ở commit sau.

## Env

Thêm vào `.env.local` và cập nhật `.env.local.example`:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...        # chỉ dùng phía server / script seed
```

(Giữ nguyên `ANTHROPIC_API_KEY` đã có.)

## Kiểm chứng (Definition of Done)

1. `npm run dev`: home hiển thị đủ 4 sản phẩm, dữ liệu đến từ DB (không còn import mảng tĩnh trong page).
2. `/product/[id]` mở được với uuid thật; id sai → trang 404.
3. Cả 3 tab try-on (AR / 3D / AI Size) vẫn hoạt động bình thường vì `try_on` JSONB giữ nguyên.
4. `npm run build` pass.
5. RLS: truy vấn bằng anon key chỉ trả về sản phẩm `is_active = true`.

## Rủi ro & lưu ý

- Số đo/đường dẫn asset try-on (GLB, PNG overlay) vẫn nằm trong `public/` — JSONB chỉ lưu đường dẫn, không đổi.
- Cần tạo project Supabase và lấy keys trước khi seed; đây là bước thủ công ngoài code.
- Numeric `price` đọc về có thể là string tùy driver — hàm map phải ép `Number()`.
```