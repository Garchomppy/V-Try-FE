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

-- ─── Orders ──────────────────────────────────────────────────────────────────
create table if not exists orders (
  id               uuid primary key default gen_random_uuid(),
  customer_name    text not null,
  customer_phone   text not null,
  customer_address text not null,
  note             text,
  items            jsonb not null,
  subtotal         numeric not null,
  status           text not null default 'pending',
  created_at       timestamptz not null default now()
);

alter table orders enable row level security;

drop policy if exists "public insert orders" on orders;
create policy "public insert orders" on orders
  for insert with check (true);
