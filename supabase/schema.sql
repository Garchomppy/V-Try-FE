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

-- ─── Profiles ────────────────────────────────────────────────────────────────
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

-- ─── Orders: link to user ───────────────────────────────────────────────────
alter table orders add column if not exists user_id uuid references auth.users(id);

drop policy if exists "users read own orders" on orders;
create policy "users read own orders"
  on orders for select
  using (auth.uid() = user_id);

-- ─── Admin role ──────────────────────────────────────────────────────────────
alter table profiles add column if not exists role text not null default 'customer';

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
