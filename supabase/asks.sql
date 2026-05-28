-- =====================================================================
-- Build Together — Community Asks
-- Run AFTER platform.sql. Idempotent.
-- Adds asks + ask_answers with answer-audience access control.
-- =====================================================================

-- Who is allowed to ANSWER an ask
do $$ begin
  create type ask_audience as enum ('open','contributors','community','trusted');
exception when duplicate_object then null; end $$;

-- Kind of ask (display + filter only)
do $$ begin
  create type ask_kind as enum (
    'general','website_roast','pitch_feedback','mvp_testing','intro','feedback'
  );
exception when duplicate_object then null; end $$;

create table if not exists public.asks (
  id          uuid primary key default gen_random_uuid(),
  author_id   uuid not null references public.profiles(id) on delete cascade,
  title       text not null,
  body        text,
  kind        ask_kind not null default 'general',
  audience    ask_audience not null default 'open',
  created_at  timestamptz not null default now()
);

create index if not exists asks_author_idx   on public.asks (author_id);
create index if not exists asks_created_idx   on public.asks (created_at desc);
create index if not exists asks_audience_idx  on public.asks (audience);

create table if not exists public.ask_answers (
  id          uuid primary key default gen_random_uuid(),
  ask_id      uuid not null references public.asks(id) on delete cascade,
  author_id   uuid not null references public.profiles(id) on delete cascade,
  body        text not null,
  created_at  timestamptz not null default now()
);

create index if not exists ask_answers_ask_idx on public.ask_answers (ask_id);

-- RLS -----------------------------------------------------------------
alter table public.asks enable row level security;
alter table public.ask_answers enable row level security;

-- Everyone authenticated can VIEW asks (visibility is open; answering is gated)
drop policy if exists "asks read for authed" on public.asks;
create policy "asks read for authed"
  on public.asks for select to authenticated using (true);

drop policy if exists "asks insert own" on public.asks;
create policy "asks insert own"
  on public.asks for insert to authenticated
  with check (author_id = auth.uid());

drop policy if exists "asks update own or admin" on public.asks;
create policy "asks update own or admin"
  on public.asks for update to authenticated
  using (author_id = auth.uid()
    or exists (select 1 from public.profiles where id = auth.uid() and is_admin))
  with check (author_id = auth.uid()
    or exists (select 1 from public.profiles where id = auth.uid() and is_admin));

drop policy if exists "asks delete own or admin" on public.asks;
create policy "asks delete own or admin"
  on public.asks for delete to authenticated
  using (author_id = auth.uid()
    or exists (select 1 from public.profiles where id = auth.uid() and is_admin));

-- Answers: everyone authed can read. Insert is gated by the ask's audience
-- vs the answerer's level (enforced in the server action; RLS keeps the
-- baseline that you can only write your own row).
drop policy if exists "answers read for authed" on public.ask_answers;
create policy "answers read for authed"
  on public.ask_answers for select to authenticated using (true);

drop policy if exists "answers insert own" on public.ask_answers;
create policy "answers insert own"
  on public.ask_answers for insert to authenticated
  with check (author_id = auth.uid());

drop policy if exists "answers delete own or admin" on public.ask_answers;
create policy "answers delete own or admin"
  on public.ask_answers for delete to authenticated
  using (author_id = auth.uid()
    or exists (select 1 from public.profiles where id = auth.uid() and is_admin));
