# SP1 — Giỏ hàng + Đặt hàng COD

> Sub-project thứ hai của lộ trình "platform bán hàng hoàn thiện".
> Lộ trình: SP0 ✅ → **SP1 (giỏ hàng + COD)** → SP2 (auth + tài khoản) → SP3 (admin).

## Mục tiêu

Cho phép người dùng thêm sản phẩm vào giỏ hàng và đặt hàng COD (thanh toán khi nhận hàng) mà không cần đăng nhập. Đơn hàng được lưu vào Supabase để SP3 admin có thể quản lý.

## Phi mục tiêu (YAGNI cho SP1)

- KHÔNG làm thanh toán online (VNPAY, Stripe).
- KHÔNG làm lịch sử đơn hàng cho user (SP2).
- KHÔNG làm quản lý tồn kho / variants.
- KHÔNG làm route `/cart` hay `/checkout` riêng — dùng drawer + modal.
- KHÔNG seed đơn hàng mẫu.

## Quyết định kiến trúc

- **Zustand** với `persist` middleware → cart state tự sync localStorage (key: `"bb-cart"`).
- **Giỏ hàng client-only** — không lưu `carts` table lên Supabase ở SP1; khi SP2 có auth sẽ gán đơn cho user qua `user_id nullable`.
- **`orders.items` là JSONB snapshot** (không bảng `order_items` riêng) — đủ cho MVP, SP3 đọc được.
- Cart drawer slide-in từ phải; checkout form trong modal; không điều hướng trang.

## Cart State — Zustand Store

File: `lib/store/cart.ts`

```ts
interface CartItem {
  productId: string;
  name: string;
  price: number;           // final price sau discount
  image: string;
  size: string;
  color: string;           // hex
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  updateQty: (productId: string, size: string, color: string, qty: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}
```

- **Unique key** của item: `productId + size + color` — cùng sản phẩm khác size/color là 2 dòng riêng.
- `addItem` cộng dồn quantity nếu item đã tồn tại.
- Dùng `persist` middleware: `zustand/middleware` → tự serialize vào `localStorage["bb-cart"]`.

## Data Layer — Supabase

### Schema (`supabase/schema.sql` — append thêm)

```sql
create table if not exists orders (
  id               uuid primary key default gen_random_uuid(),
  customer_name    text not null,
  customer_phone   text not null,
  customer_address text not null,
  note             text,
  items            jsonb not null,   -- CartItem[] snapshot
  subtotal         numeric not null,
  status           text not null default 'pending',
  created_at       timestamptz not null default now()
);

alter table orders enable row level security;

-- Khách vãng lai có thể đặt hàng (insert)
drop policy if exists "public insert orders" on orders;
create policy "public insert orders" on orders
  for insert with check (true);

-- Không có select/update policy cho anon → chỉ service role (SP3 admin) đọc được
```

`status` values: `pending` | `confirmed` | `shipped` | `delivered` | `cancelled`.

### Data function (`lib/db/orders.ts`)

```ts
export interface CreateOrderPayload {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  note?: string;
  items: CartItem[];
  subtotal: number;
}

export async function createOrder(payload: CreateOrderPayload): Promise<{ id: string }>;
```

Dùng `createServerSupabase()` (anon key) — RLS `insert` policy cho phép ghi.

## UI Components

### `components/cart/CartDrawer.tsx`
- `"use client"` — đọc Zustand store
- Slide-in từ phải (fixed overlay, z-50)
- Danh sách item: ảnh thumbnail, tên, size, màu, qty controls (+/-), nút xóa
- Footer: subtotal + nút "Đặt hàng" → mở `CheckoutModal`
- Nếu cart trống: empty state với CTA "Khám phá sản phẩm"

### `components/cart/CheckoutModal.tsx`
- `"use client"` — form state local (`useState`)
- Fields: Họ tên*, SĐT*, Địa chỉ*, Ghi chú (optional)
- Submit → `createOrder()` → success screen inline (không close modal ngay)
- Success screen: "Đặt hàng thành công! Mã đơn: `xxxx-xxxx`" (8 ký tự đầu uuid) + nút "Tiếp tục mua sắm" → `clearCart()` + đóng tất cả
- Loading state khi đang gọi API; error toast nếu thất bại

### Sửa `components/layout/Header.tsx`
- Thêm cart icon (ShoppingBag từ lucide-react) + badge số lượng item
- Click → `openCart()`

### Sửa `components/product/ProductDetailClient.tsx`
- "Add to Cart" button hiện tại là placeholder → gọi `addItem({ productId, name, price: finalPrice, image: images[0], size: selectedSize, color: selectedColor })` + `openCart()`

## Files cần tạo / sửa

| File | Action |
|---|---|
| `lib/store/cart.ts` | Tạo mới |
| `lib/db/orders.ts` | Tạo mới |
| `supabase/schema.sql` | Append orders table + RLS |
| `components/cart/CartDrawer.tsx` | Tạo mới |
| `components/cart/CheckoutModal.tsx` | Tạo mới |
| `components/layout/Header.tsx` | Sửa: cart icon + badge + openCart |
| `components/product/ProductDetailClient.tsx` | Sửa: wire "Add to Cart" |

## Definition of Done

1. Thêm sản phẩm vào giỏ → cart drawer mở, hiện item đúng.
2. Thay đổi qty, xóa item hoạt động đúng.
3. Reload trang → giỏ hàng vẫn còn (localStorage persist).
4. Điền form checkout → submit → đơn xuất hiện trong Supabase `orders` table.
5. Success screen hiển thị mã đơn.
6. `npm run build` pass.

## Rủi ro & lưu ý

- `zustand` cần cài thêm (`npm install zustand`).
- Cart drawer dùng `CartDrawer` nên cần render ở layout hoặc trong `Header` — cân nhắc đặt trong `app/layout.tsx` để tránh mount/unmount.
- `createOrder` dùng anon key insert — RLS policy `with check (true)` là đủ cho MVP; SP3 sẽ add service role cho update status.
- Phone validation: chỉ check không rỗng ở MVP (không regex phức tạp).
