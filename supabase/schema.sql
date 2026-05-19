-- =====================================================================
-- Build Together by ALIF — database schema
-- Paste this into Supabase SQL Editor (one shot, idempotent).
-- =====================================================================

-- Extensions ----------------------------------------------------------
create extension if not exists "pgcrypto";

-- Enums ---------------------------------------------------------------
do $$ begin
  create type role_type as enum
    ('technical','business','product','design','operator','domain_expert');
exception when duplicate_object then null; end $$;

do $$ begin
  create type startup_stage as enum
    ('exploring','has_idea','building','launched');
exception when duplicate_object then null; end $$;

do $$ begin
  create type looking_for_kind as enum
    ('cofounder','collaborator','project_team','sprint_team');
exception when duplicate_object then null; end $$;

do $$ begin
  create type commitment_level as enum
    ('exploring','side_project','part_time','full_time');
exception when duplicate_object then null; end $$;

do $$ begin
  create type working_style as enum
    ('async_first','sync_heavy','mixed');
exception when duplicate_object then null; end $$;

-- Profiles table ------------------------------------------------------
create table if not exists public.profiles (
  id                   uuid primary key references auth.users(id) on delete cascade,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),

  full_name            text not null,
  avatar_url           text,
  location             text,
  timezone             text,

  role_type            role_type,
  skills               text[]    not null default '{}',
  industries           text[]    not null default '{}',

  startup_stage        startup_stage,
  looking_for          looking_for_kind[] not null default '{}',

  weekly_hours         smallint check (weekly_hours is null or (weekly_hours >= 0 and weekly_hours <= 80)),
  bio                  text,

  proof_of_work        jsonb not null default '[]'::jsonb, -- [{label, url}]
  past_projects        jsonb not null default '[]'::jsonb, -- [{name, link, description}]

  working_style        working_style,
  commitment_level     commitment_level,

  open_to_remote       boolean not null default true,
  open_to_in_person    boolean not null default false
);

create index if not exists profiles_role_type_idx     on public.profiles (role_type);
create index if not exists profiles_startup_stage_idx on public.profiles (startup_stage);
create index if not exists profiles_skills_gin        on public.profiles using gin (skills);
create index if not exists profiles_industries_gin    on public.profiles using gin (industries);

-- updated_at trigger --------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Row Level Security --------------------------------------------------
alter table public.profiles enable row level security;

drop policy if exists "profiles read for authed" on public.profiles;
create policy "profiles read for authed"
  on public.profiles for select
  to authenticated
  using (true);

drop policy if exists "profiles insert own" on public.profiles;
create policy "profiles insert own"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists "profiles delete own" on public.profiles;
create policy "profiles delete own"
  on public.profiles for delete
  to authenticated
  using (id = auth.uid());

-- Storage bucket: avatars --------------------------------------------
insert into storage.buckets (id, name, public)
values ('avatars','avatars', true)
on conflict (id) do nothing;

-- Storage policies: users may write only inside their own {uid}/ folder
drop policy if exists "avatars public read"  on storage.objects;
create policy "avatars public read"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "avatars insert own"   on storage.objects;
create policy "avatars insert own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars update own"   on storage.objects;
create policy "avatars update own"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars delete own"   on storage.objects;
create policy "avatars delete own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
