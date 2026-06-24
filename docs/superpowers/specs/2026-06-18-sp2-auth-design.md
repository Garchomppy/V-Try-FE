# SP2 — Đăng nhập / Tài khoản

> Sub-project thứ ba của lộ trình "platform bán hàng hoàn thiện".
> Lộ trình: SP0 ✅ → SP1 ✅ → **SP2 (auth + tài khoản)** → SP3 (admin).

## Mục tiêu

Cho phép người dùng đăng ký/đăng nhập bằng email + password, quản lý thông tin cá nhân (tên/SĐT/địa chỉ), xem lịch sử đơn hàng. Checkout COD tự điền thông tin nếu đã đăng nhập, nhưng vẫn cho phép đặt hàng không cần đăng nhập (guest checkout giữ nguyên từ SP1).

## Phi mục tiêu (YAGNI cho SP2)

- KHÔNG làm Google OAuth (để SP sau).
- KHÔNG bắt buộc đăng nhập để checkout — guest checkout vẫn hoạt động.
- KHÔNG làm wishlist, multi-address, đổi mật khẩu qua email reset flow phức tạp (chỉ basic).
- KHÔNG làm role-based access (admin riêng là SP3).
- KHÔNG làm dropdown menu phức tạp ở Header — chỉ link đơn giản tới `/account` hoặc `/login`.

## Quyết định kiến trúc

- **`@supabase/ssr`** — package chính thức cho session qua cookies trong Next.js App Router (thay cho cách dùng `@supabase/supabase-js` thuần ở SP0/SP1 cho phần auth).
- **Email/Password only** ở SP2; tắt "Confirm email" trong Supabase Dashboard để login ngay sau signup (MVP, giảm friction).
- **`/login`, `/signup`, `/account`** là route riêng (Server Components), không dùng modal — khác pattern cart/checkout của SP1 theo yêu cầu người dùng.
- **Guest checkout vẫn hoạt động** — `orders.user_id` nullable; nếu có session khi đặt hàng, gán `user_id`; nếu không, để null như SP1.
- **`/account`** gộp 1 trang: sửa profile + xem lịch sử đơn hàng (không tách `/account/profile` và `/account/orders`).

## Data Model

### `profiles` table (append vào `supabase/schema.sql`)

```sql
create table if not exists profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  full_name    text,
  phone        text,
  address      text,
  created_at   timestamptz not null default now()
);

alter table profiles enable row level security;

drop policy if exists "users manage own profile" on profiles;
create policy "users manage own profile"
  on profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

create or replace function handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
```

### `orders` table — thêm `user_id`

```sql
alter table orders add column if not exists user_id uuid references auth.users(id);

drop policy if exists "users read own orders" on orders;
create policy "users read own orders"
  on orders for select
  using (auth.uid() = user_id);
```

Policy insert public (`public insert orders`, từ SP1) giữ nguyên — guest vẫn insert được; `user_id` được set trong cùng câu insert khi có session.

## Supabase Client / Session Layer

- `lib/supabase/server.ts` — sửa để dùng `createServerClient` từ `@supabase/ssr`, đọc/ghi cookie qua `next/headers` (cần là async function vì Next 15 `cookies()` là async).
- `lib/supabase/middleware.ts` — helper `updateSession(request)` refresh token, dùng trong `middleware.ts`.
- `middleware.ts` (root, mới) — gọi `updateSession` trên mọi request trừ static assets.
- `lib/supabase/client.ts` — giữ nguyên (browser client, dùng trong Client Components cần gọi `supabase.auth.signInWithPassword/signUp/signOut` trực tiếp).

## Data Layer

### `lib/db/profiles.ts` (mới)

```ts
export async function getProfile(userId: string): Promise<Profile | null>;
export async function upsertProfile(userId: string, data: Partial<Profile>): Promise<void>;
```

### `lib/db/orders.ts` (sửa)

- Thêm `getOrdersByUserId(userId: string): Promise<Order[]>`.
- `CreateOrderPayload` thêm field `userId?: string`.
- `buildOrderRow` set `user_id: payload.userId ?? null`.

## UI & Routes

| Route/Component | Trách nhiệm |
|---|---|
| `app/login/page.tsx` (Server) | Render `LoginForm`; nếu đã có session → redirect `/account` |
| `components/auth/LoginForm.tsx` (Client) | Form email/password → `supabase.auth.signInWithPassword()` → redirect `/account` |
| `app/signup/page.tsx` (Server) | Render `SignupForm`; nếu đã có session → redirect `/account` |
| `components/auth/SignupForm.tsx` (Client) | Form email/password → `supabase.auth.signUp()` → redirect `/account` |
| `app/account/page.tsx` (Server) | Đọc session; nếu null → redirect `/login`; fetch profile + orders; render `AccountProfileForm` + `OrderHistoryList` + nút Đăng xuất |
| `components/account/AccountProfileForm.tsx` (Client) | Form sửa tên/SĐT/địa chỉ → gọi API route cập nhật `profiles` |
| `components/account/OrderHistoryList.tsx` (Client hoặc Server con) | Danh sách đơn: mã đơn, ngày, status badge, tổng tiền, items rút gọn |
| `components/auth/UserMenuButton.tsx` (Client) | Thay nút User tĩnh trong Header; đọc session qua browser client; link `/account` (đã login) hoặc `/login` (chưa) |
| `components/layout/Header.tsx` (sửa) | Dùng `UserMenuButton` thay nút `<User>` tĩnh |

### Checkout integration

- `components/cart/CheckoutModal.tsx` — nhận prop `defaultValues?: { customerName, customerPhone, customerAddress }`, pre-fill `useState` ban đầu.
- `components/cart/CartDrawer.tsx` — đọc session + profile qua browser client (hoặc nhận từ context), truyền `defaultValues` xuống `CheckoutModal`.
- `app/api/orders/route.ts` — đọc session qua `createServerSupabase()`; nếu có user → truyền `userId` vào `createOrder()`.

## Definition of Done

1. Signup bằng email/password → tài khoản tạo trong Supabase Auth; trigger tự tạo `profiles` row rỗng.
2. Login → redirect `/account`; hiển thị form profile (rỗng lần đầu) + danh sách đơn hàng (rỗng nếu chưa đặt).
3. Sửa profile (tên/SĐT/địa chỉ) → lưu vào `profiles`; reload trang vẫn còn dữ liệu.
4. Đặt hàng COD khi đã đăng nhập → đơn xuất hiện trong `/account`, `user_id` set đúng trong Supabase Table Editor.
5. Đặt hàng COD khi **chưa** đăng nhập (guest) → vẫn thành công như SP1, `user_id` là null.
6. Checkout form tự điền tên/SĐT/địa chỉ nếu đã đăng nhập và có profile.
7. Đăng xuất → `UserMenuButton` quay về trạng thái chưa đăng nhập; truy cập `/account` → redirect `/login`.
8. `npm run build` pass; `npm test` pass.

## Rủi ro & lưu ý

- **Thao tác thủ công bắt buộc:** tắt "Confirm email" trong Supabase Dashboard → Authentication → Settings → Email Auth, trước khi test signup. Sẽ nhắc người dùng làm bước này.
- `middleware.ts` cần matcher loại trừ `_next/static`, `_next/image`, favicon, file ảnh để tránh chạy trên mọi static asset.
- Next.js 15: `cookies()` từ `next/headers` là async — `createServerSupabase()` phải trở thành `async function`, mọi nơi gọi nó (`lib/db/products.ts`, `lib/db/orders.ts`) cần thêm `await`.
- `@supabase/ssr` là package mới cần cài, không ảnh hưởng `@supabase/supabase-js` đã có (dùng làm peer dependency).
