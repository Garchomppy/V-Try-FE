-- supabase/live_schema.sql
-- Livestream commerce: live sessions (embedded TikTok/Facebook/YouTube) + chat.

-- ─── Live sessions ───────────────────────────────────────────────────────────
create table if not exists live_sessions (
  id                 uuid primary key default gen_random_uuid(),
  title              text not null,
  description        text,
  host_name          text,
  platform           text not null default 'youtube'
                       check (platform in ('youtube', 'facebook', 'tiktok')),
  video_url          text not null,
  status             text not null default 'scheduled'
                       check (status in ('scheduled', 'live', 'ended')),
  pinned_product_ids jsonb not null default '[]',
  created_at         timestamptz not null default now()
);

alter table live_sessions enable row level security;

-- Anyone can view sessions (customers browse live / scheduled streams).
drop policy if exists "public read live sessions" on live_sessions;
create policy "public read live sessions" on live_sessions
  for select
  using (true);

-- Only admins manage sessions.
drop policy if exists "admin manage live sessions" on live_sessions;
create policy "admin manage live sessions" on live_sessions
  for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- ─── Live chat messages ──────────────────────────────────────────────────────
create table if not exists live_messages (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references live_sessions(id) on delete cascade,
  user_id     uuid references auth.users(id) on delete set null,
  user_name   text not null,
  content     text not null,
  created_at  timestamptz not null default now()
);

create index if not exists live_messages_session_idx
  on live_messages (session_id, created_at);

alter table live_messages enable row level security;

-- Anyone can read chat.
drop policy if exists "public read live messages" on live_messages;
create policy "public read live messages" on live_messages
  for select
  using (true);

-- Logged-in users can post a message as themselves.
drop policy if exists "users insert live messages" on live_messages;
create policy "users insert live messages" on live_messages
  for insert
  with check (auth.uid() = user_id);

-- Admins can moderate (delete) any message.
drop policy if exists "admin manage live messages" on live_messages;
create policy "admin manage live messages" on live_messages
  for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- ─── Realtime ────────────────────────────────────────────────────────────────
-- Broadcast row changes so pinned products / status / chat update live.
-- (Safe to run repeatedly: ignore "already member of publication" errors.)
do $$
begin
  alter publication supabase_realtime add table live_sessions;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table live_messages;
exception when duplicate_object then null;
end $$;
