-- =====================================================================
-- Build Together by ALIF — discovery migration
-- Run this AFTER supabase/schema.sql. Idempotent.
-- Adds: verified column on profiles, interests table, matches view,
-- invitations table, with RLS for all of them.
-- =====================================================================

-- 1. Verified flag on profiles ---------------------------------------
alter table public.profiles
  add column if not exists verified boolean not null default false;

create index if not exists profiles_verified_idx on public.profiles (verified);


-- 2. Interests table -------------------------------------------------
create table if not exists public.interests (
  from_user   uuid not null references public.profiles(id) on delete cascade,
  to_user     uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (from_user, to_user),
  check (from_user <> to_user)
);

create index if not exists interests_to_user_idx   on public.interests (to_user);
create index if not exists interests_from_user_idx on public.interests (from_user);

alter table public.interests enable row level security;

drop policy if exists "interests select own"  on public.interests;
create policy "interests select own"
  on public.interests for select
  to authenticated
  using (from_user = auth.uid() or to_user = auth.uid());

drop policy if exists "interests insert own"  on public.interests;
create policy "interests insert own"
  on public.interests for insert
  to authenticated
  with check (from_user = auth.uid());

drop policy if exists "interests delete own"  on public.interests;
create policy "interests delete own"
  on public.interests for delete
  to authenticated
  using (from_user = auth.uid());


-- 3. Matches view (mutual interests) ---------------------------------
-- security_invoker so RLS on interests is respected per caller.
drop view if exists public.matches;
create view public.matches
  with (security_invoker = true) as
select
  least(a.from_user, a.to_user)        as user_a,
  greatest(a.from_user, a.to_user)     as user_b,
  greatest(a.created_at, b.created_at) as matched_at
from public.interests a
join public.interests b
  on a.from_user = b.to_user
 and a.to_user   = b.from_user
where a.from_user < a.to_user;


-- 4. Invitations table (stub — full flow lands with Sprints) ---------
create table if not exists public.invitations (
  id            uuid primary key default gen_random_uuid(),
  from_user     uuid not null references public.profiles(id) on delete cascade,
  to_user       uuid not null references public.profiles(id) on delete cascade,
  project_topic text,
  message       text,
  status        text not null default 'pending'
                check (status in ('pending','accepted','declined','withdrawn')),
  created_at    timestamptz not null default now(),
  check (from_user <> to_user)
);

create index if not exists invitations_to_user_idx   on public.invitations (to_user);
create index if not exists invitations_from_user_idx on public.invitations (from_user);

alter table public.invitations enable row level security;

drop policy if exists "invitations select own" on public.invitations;
create policy "invitations select own"
  on public.invitations for select
  to authenticated
  using (from_user = auth.uid() or to_user = auth.uid());

drop policy if exists "invitations insert own" on public.invitations;
create policy "invitations insert own"
  on public.invitations for insert
  to authenticated
  with check (from_user = auth.uid());

-- Sender can withdraw; recipient can accept/decline.
drop policy if exists "invitations update own" on public.invitations;
create policy "invitations update own"
  on public.invitations for update
  to authenticated
  using (from_user = auth.uid() or to_user = auth.uid())
  with check (from_user = auth.uid() or to_user = auth.uid());
