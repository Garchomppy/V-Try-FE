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
