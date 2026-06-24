# SP3 — Trang Admin quản lý sản phẩm/đơn hàng

> Sub-project cuối của lộ trình "platform bán hàng hoàn thiện".
> Lộ trình: SP0 ✅ → SP1 ✅ → SP2 ✅ → **SP3 (admin)**.

## Mục tiêu

Cho phép một tài khoản có vai trò `admin` đăng nhập vào `/admin` để quản lý sản phẩm (CRUD cơ bản) và đơn hàng (xem + đổi trạng thái), tách biệt hoàn toàn khỏi UI khách hàng.

## Phi mục tiêu (YAGNI cho SP3)

- KHÔNG làm CRUD cho `tryOn` config (AR overlay, 3D model, size chart) — vẫn quản lý qua SQL/seed như trước; trang edit chỉ hiển thị read-only nếu có.
- KHÔNG làm upload ảnh lên Supabase Storage — ảnh nhập qua URL dán tay (textarea, mỗi dòng 1 URL).
- KHÔNG làm UI "promote user thành admin" — set role admin đầu tiên qua SQL thủ công.
- KHÔNG xóa cứng sản phẩm — chỉ soft delete (`is_active = false`) để giữ tham chiếu lịch sử đơn hàng.
- KHÔNG làm thống kê/dashboard số liệu (revenue chart, v.v.) — chỉ CRUD + danh sách.
- KHÔNG làm phân quyền nhiều cấp (admin/staff/super-admin) — chỉ 1 vai trò `admin` duy nhất.

## Quyết định kiến trúc

- **Role-based access qua cột `profiles.role`** (`'customer' | 'admin'`, default `'customer'`) — tái dùng toàn bộ hạ tầng auth từ SP2, không xây hệ thống đăng nhập admin riêng.
- **shadcn/ui** cho riêng phần `/admin` (Table, Dialog, Button, Input, Select, Badge, Label, Textarea, Sonner toast) — vì `/admin` tách biệt hoàn toàn khỏi UI khách hàng (không Header/Footer chung), không có vấn đề xung đột design system với phần site Tailwind thuần hiện tại. Admin cần table/form/dialog nhanh — đúng sở trường shadcn.
- **Next.js Server Actions** cho mọi mutation (`createProduct`, `updateProduct`, `deleteProduct`, `updateOrderStatus`) — gọn hơn route API riêng cho form submit, phù hợp Approach A đã chọn.
- **`app/admin/layout.tsx`** làm guard tập trung — check session + `role === 'admin'`, redirect `/` nếu không đạt. Mọi route con tự động được bảo vệ.

## Data Model

### `profiles.role` (append vào `supabase/schema.sql`)

```sql
alter table profiles add column if not exists role text not null default 'customer';
```

Set admin đầu tiên (thao tác thủ công, KHÔNG phải migration tự động):
```sql
update profiles set role = 'admin' where id = '<uuid-của-admin>';
```

### RLS bổ sung — Admin full access

```sql
drop policy if exists "admin manage all orders" on orders;
create policy "admin manage all orders"
  on orders for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "admin manage all products" on products;
create policy "admin manage all products"
  on products for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
```

(Các policy public hiện có — đọc sản phẩm active, insert order công khai — giữ nguyên, không xung đột vì Postgres RLS là OR giữa các policy permissive.)

## shadcn/ui Setup

```bash
npx shadcn@latest init
npx shadcn@latest add table button input dialog badge select textarea label sonner
```

Dùng theme/style default của shadcn init — không tùy biến màu sắc ở SP3.

## Layout & Routes

```
app/admin/
  layout.tsx              — guard (session + role=admin), sidebar nav
  page.tsx                 — redirect → /admin/products
  products/
    page.tsx                — table tất cả sản phẩm (kể cả is_active=false, hiển thị mờ/badge "Đã ẩn")
    new/page.tsx              — form thêm sản phẩm mới
    [id]/edit/page.tsx        — form sửa sản phẩm
  orders/
    page.tsx                 — table tất cả đơn hàng, filter qua query param ?status=
```

`app/admin/layout.tsx`: Server Component, `await createServerSupabase()` → `auth.getUser()` → nếu không có user, redirect `/login`; nếu có user nhưng `profiles.role !== 'admin'`, redirect `/`. Render `Sidebar` (component riêng, link: Sản phẩm / Đơn hàng / Đăng xuất) + `{children}`.

## Data Layer bổ sung

`lib/db/products.ts` — thêm hàm mới (không sửa các hàm hiện có):
```ts
export async function getAllProductsForAdmin(): Promise<Product[]>;
// select * không filter is_active, dùng cho /admin/products
```

`Product` type cần thêm field `isActive: boolean` để UI admin hiển thị badge trạng thái (mở rộng `lib/types/product.ts`, `mapRowToProduct` trong `lib/db/products.ts`).

## Server Actions

### `lib/actions/products.ts` (mới, `"use server"`)

```ts
export async function createProduct(formData: FormData): Promise<{ error?: string }>;
export async function updateProduct(id: string, formData: FormData): Promise<{ error?: string }>;
export async function deleteProduct(id: string): Promise<{ error?: string }>;
// deleteProduct = soft delete: update is_active = false
```

Mỗi action: `await createServerSupabase()` → check `auth.getUser()` + `profiles.role === 'admin'` ngay trong action (defense in depth, không chỉ dựa vào layout) → trả `{ error: "Unauthorized" }` nếu fail → thực hiện insert/update → `revalidatePath("/admin/products")` → redirect (cho create/update) hoặc trả `{ }` (cho delete, page tự revalidate).

Form fields parse từ `FormData`: `name`, `description`, `price` (number), `discountPercentage` (number, optional), `images` (textarea, split theo dòng → string[]), `colors` (input dạng `"Đen:#000000, Trắng:#FFFFFF"` parse thành `{name, hex}[]`), `sizes` (input dạng `"S, M, L, XL"` parse thành string[]).

### `lib/actions/orders.ts` (mới)

```ts
export async function updateOrderStatus(orderId: string, status: string): Promise<{ error?: string }>;
```
Check admin role, update `orders.status`, `revalidatePath("/admin/orders")`.

## UI Components

| Component | Trách nhiệm |
|---|---|
| `components/admin/Sidebar.tsx` | Nav tĩnh: Sản phẩm, Đơn hàng, Đăng xuất (dùng lại `LogoutButton` logic hoặc tạo bản admin riêng nếu cần style khác) |
| `components/admin/ProductForm.tsx` | Form dùng chung cho `new` và `edit` (nhận `product?: Product` optional — nếu có thì là edit mode), submit gọi server action tương ứng qua `<form action={...}>` |
| `app/admin/products/page.tsx` | shadcn `Table`: cột Tên / Giá / Active / Actions (Sửa, Xóa qua `Dialog` xác nhận) |
| `app/admin/orders/page.tsx` | shadcn `Table` + `Select` filter status ở đầu trang; mỗi dòng có `Select` đổi status (gọi `updateOrderStatus` qua client wrapper nhỏ) |

## Definition of Done

1. User `role=customer` truy cập `/admin` → redirect `/`. Chưa đăng nhập → redirect `/login`.
2. Admin đăng nhập → vào `/admin` → tự redirect `/admin/products`, thấy danh sách đủ sản phẩm (kể cả đã ẩn).
3. Thêm sản phẩm mới qua form → xuất hiện trong danh sách admin + trang chủ site khách (nếu `is_active=true`).
4. Sửa sản phẩm → cập nhật đúng, phản ánh ngay trên site khách.
5. "Xóa" (ẩn) sản phẩm → `is_active=false` → biến mất khỏi site khách, vẫn còn trong danh sách admin với badge "Đã ẩn".
6. `/admin/orders` → thấy TẤT CẢ đơn hàng (không chỉ đơn của admin); filter theo status qua query param hoạt động đúng.
7. Đổi status đơn trong admin → lưu vào DB; khách xem `/account` thấy status mới.
8. `npm run build` pass; `npm test` pass.

## Rủi ro & lưu ý

- **Thao tác thủ công bắt buộc:** chạy SQL thêm `profiles.role` + RLS policies, sau đó `update profiles set role='admin' where id=...` cho tài khoản admin đầu tiên (đăng ký qua `/signup` trước, lấy uuid từ Supabase Dashboard).
- shadcn `init` sẽ hỏi vài câu (style, base color, CSS variables) — chọn default, không cấu hình sâu.
- `images`/`colors`/`sizes` nhập dạng text parse tay (không có UI thêm/xóa từng dòng động) — chấp nhận được cho MVP, có thể nâng cấp UX ở giai đoạn sau nếu cần.
- Cần đảm bảo Server Actions chạy đúng `runtime nodejs` ngầm định của Next.js (không cần khai báo `export const runtime` như route handlers).
