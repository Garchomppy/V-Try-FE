-- supabase/promotions_schema.sql

-- Bảng promotions lưu các thông tin về chương trình khuyến mãi
create table if not exists promotions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  discount_percentage int not null check (discount_percentage >= 0 and discount_percentage <= 100),
  start_date timestamptz,
  end_date timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Bảng liên kết product_promotions để áp dụng khuyến mãi cho các sản phẩm cụ thể
create table if not exists product_promotions (
  product_id uuid references products(id) on delete cascade,
  promotion_id uuid references promotions(id) on delete cascade,
  primary key (product_id, promotion_id)
);

-- Kích hoạt RLS (Row Level Security) cho các bảng mới
alter table promotions enable row level security;
alter table product_promotions enable row level security;

-- Cho phép người dùng công cộng đọc thông tin khuyến mãi đang hoạt động
drop policy if exists "public read active promotions" on promotions;
create policy "public read active promotions" on promotions
  for select
  using (is_active = true);

-- Cho phép đọc thông tin liên kết sản phẩm - khuyến mãi
drop policy if exists "public read product promotions" on product_promotions;
create policy "public read product promotions" on product_promotions
  for select
  using (true);

-- Cho phép Admin quản lý toàn bộ các chương trình khuyến mãi
drop policy if exists "admin manage promotions" on promotions;
create policy "admin manage promotions" on promotions
  for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Cho phép Admin quản lý các sản phẩm trong chương trình khuyến mãi
drop policy if exists "admin manage product promotions" on product_promotions;
create policy "admin manage product promotions" on product_promotions
  for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
