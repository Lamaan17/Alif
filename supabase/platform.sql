-- =====================================================================
-- Build Together — platform migration
-- Run AFTER schema.sql and discovery.sql. Idempotent.
-- Adds: admin flag, levels, badges, projects, sprints, applications,
-- intro_requests. Plus RLS for all.
-- =====================================================================

-- 1. Profile additions: admin + level -------------------------------
alter table public.profiles
  add column if not exists is_admin boolean not null default false;

alter table public.profiles
  add column if not exists level smallint not null default 1
  check (level >= 0 and level <= 4);

create index if not exists profiles_level_idx on public.profiles (level);
create index if not exists profiles_is_admin_idx on public.profiles (is_admin) where is_admin = true;


-- 2. Badges ----------------------------------------------------------
do $$ begin
  create type badge_kind as enum (
    'alif_verified','event_attendee','cohort_member',
    'sprint_finisher','shipped_project','mentor_endorsed','active_collaborator'
  );
exception when duplicate_object then null; end $$;

create table if not exists public.profile_badges (
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  kind        badge_kind not null,
  awarded_at  timestamptz not null default now(),
  note        text,
  primary key (profile_id, kind)
);

create index if not exists profile_badges_kind_idx on public.profile_badges (kind);

alter table public.profile_badges enable row level security;

drop policy if exists "badges read for authed" on public.profile_badges;
create policy "badges read for authed"
  on public.profile_badges for select
  to authenticated using (true);

drop policy if exists "badges admin write" on public.profile_badges;
create policy "badges admin write"
  on public.profile_badges for all
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin))
  with check (exists (select 1 from public.profiles where id = auth.uid() and is_admin));


-- 3. Projects --------------------------------------------------------
do $$ begin
  create type project_collab_mode as enum ('remote','in_person','hybrid');
exception when duplicate_object then null; end $$;

create table if not exists public.projects (
  id                    uuid primary key default gen_random_uuid(),
  owner_id              uuid not null references public.profiles(id) on delete cascade,
  title                 text not null,
  one_liner             text not null,
  problem               text,
  industry              text,
  current_stage         startup_stage,
  skills_needed         text[] not null default '{}',
  ideal_collaborator    role_type,
  time_commitment_hours smallint check (time_commitment_hours is null or (time_commitment_hours between 1 and 80)),
  duration_weeks        smallint check (duration_weeks is null or (duration_weeks between 1 and 52)),
  collab_mode           project_collab_mode default 'remote',
  deadline              date,
  created_at            timestamptz not null default now()
);

create index if not exists projects_owner_idx        on public.projects (owner_id);
create index if not exists projects_industry_idx     on public.projects (industry);
create index if not exists projects_stage_idx        on public.projects (current_stage);
create index if not exists projects_deadline_idx     on public.projects (deadline);
create index if not exists projects_skills_gin       on public.projects using gin (skills_needed);

alter table public.projects enable row level security;

drop policy if exists "projects read for authed" on public.projects;
create policy "projects read for authed"
  on public.projects for select
  to authenticated using (true);

drop policy if exists "projects insert own" on public.projects;
create policy "projects insert own"
  on public.projects for insert
  to authenticated
  with check (owner_id = auth.uid());

drop policy if exists "projects update own or admin" on public.projects;
create policy "projects update own or admin"
  on public.projects for update
  to authenticated
  using (owner_id = auth.uid() or exists (select 1 from public.profiles where id = auth.uid() and is_admin))
  with check (owner_id = auth.uid() or exists (select 1 from public.profiles where id = auth.uid() and is_admin));

drop policy if exists "projects delete own or admin" on public.projects;
create policy "projects delete own or admin"
  on public.projects for delete
  to authenticated
  using (owner_id = auth.uid() or exists (select 1 from public.profiles where id = auth.uid() and is_admin));


-- 4. Sprints ---------------------------------------------------------
create table if not exists public.sprints (
  id                  uuid primary key default gen_random_uuid(),
  title               text not null,
  theme               text,
  description         text,
  deliverable         text,
  start_date          date not null,
  end_date            date not null,
  max_team_size       smallint not null default 3 check (max_team_size between 2 and 10),
  recommended_roles   role_type[] not null default '{}',
  created_at          timestamptz not null default now(),
  check (end_date >= start_date)
);

create index if not exists sprints_start_idx on public.sprints (start_date);

alter table public.sprints enable row level security;

drop policy if exists "sprints read for authed" on public.sprints;
create policy "sprints read for authed"
  on public.sprints for select
  to authenticated using (true);

drop policy if exists "sprints admin write" on public.sprints;
create policy "sprints admin write"
  on public.sprints for all
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin))
  with check (exists (select 1 from public.profiles where id = auth.uid() and is_admin));


-- 5. Applications (projects + sprints in one table) -----------------
do $$ begin
  create type application_target as enum ('project','sprint');
exception when duplicate_object then null; end $$;

do $$ begin
  create type application_status as enum ('pending','accepted','declined','withdrawn');
exception when duplicate_object then null; end $$;

create table if not exists public.applications (
  id            uuid primary key default gen_random_uuid(),
  target_type   application_target not null,
  target_id     uuid not null,
  applicant_id  uuid not null references public.profiles(id) on delete cascade,
  message       text,
  status        application_status not null default 'pending',
  created_at    timestamptz not null default now(),
  decided_at    timestamptz,
  unique (target_type, target_id, applicant_id)
);

create index if not exists apps_applicant_idx on public.applications (applicant_id);
create index if not exists apps_target_idx    on public.applications (target_type, target_id);

alter table public.applications enable row level security;

drop policy if exists "apps select own or owner or admin" on public.applications;
create policy "apps select own or owner or admin"
  on public.applications for select
  to authenticated
  using (
    applicant_id = auth.uid()
    or (target_type = 'project' and target_id in (
      select id from public.projects where owner_id = auth.uid()
    ))
    or exists (select 1 from public.profiles where id = auth.uid() and is_admin)
  );

drop policy if exists "apps insert own" on public.applications;
create policy "apps insert own"
  on public.applications for insert
  to authenticated
  with check (applicant_id = auth.uid());

drop policy if exists "apps update owner or admin or self-withdraw" on public.applications;
create policy "apps update owner or admin or self-withdraw"
  on public.applications for update
  to authenticated
  using (
    applicant_id = auth.uid()
    or (target_type = 'project' and target_id in (
      select id from public.projects where owner_id = auth.uid()
    ))
    or exists (select 1 from public.profiles where id = auth.uid() and is_admin)
  )
  with check (
    applicant_id = auth.uid()
    or (target_type = 'project' and target_id in (
      select id from public.projects where owner_id = auth.uid()
    ))
    or exists (select 1 from public.profiles where id = auth.uid() and is_admin)
  );


-- 6. Intro requests (Founder Circle) --------------------------------
create table if not exists public.intro_requests (
  id          uuid primary key default gen_random_uuid(),
  from_user   uuid not null references public.profiles(id) on delete cascade,
  to_user     uuid not null references public.profiles(id) on delete cascade,
  message     text,
  status      text not null default 'pending'
              check (status in ('pending','accepted','declined')),
  created_at  timestamptz not null default now(),
  check (from_user <> to_user)
);

create index if not exists intro_to_idx on public.intro_requests (to_user);

alter table public.intro_requests enable row level security;

drop policy if exists "intro select own or admin" on public.intro_requests;
create policy "intro select own or admin"
  on public.intro_requests for select
  to authenticated
  using (
    from_user = auth.uid() or to_user = auth.uid()
    or exists (select 1 from public.profiles where id = auth.uid() and is_admin)
  );

drop policy if exists "intro insert own" on public.intro_requests;
create policy "intro insert own"
  on public.intro_requests for insert
  to authenticated
  with check (from_user = auth.uid());

drop policy if exists "intro update party or admin" on public.intro_requests;
create policy "intro update party or admin"
  on public.intro_requests for update
  to authenticated
  using (
    from_user = auth.uid() or to_user = auth.uid()
    or exists (select 1 from public.profiles where id = auth.uid() and is_admin)
  );
