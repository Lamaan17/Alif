-- =====================================================================
-- Build Together — demo Community Asks + 3 new authors
-- Run AFTER asks.sql + badges-v2.sql + seed-platform.sql. Idempotent.
-- =====================================================================

-- 0. Helper (matches seed-platform.sql pattern)
create or replace function public._seed_demo_builder(
  p_id              uuid,
  p_email           text,
  p_full_name       text,
  p_location        text,
  p_timezone        text,
  p_role_type       role_type,
  p_skills          text[],
  p_industries      text[],
  p_startup_stage   startup_stage,
  p_looking_for     looking_for_kind[],
  p_weekly_hours    smallint,
  p_bio             text,
  p_proof_of_work   jsonb,
  p_past_projects   jsonb,
  p_working_style   working_style,
  p_commitment      commitment_level,
  p_open_remote     boolean,
  p_open_in_person  boolean,
  p_verified        boolean
) returns void
language plpgsql security definer as $$
begin
  insert into auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  )
  values (
    p_id, '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', p_email, '', now(),
    jsonb_build_object('provider','seed','providers', array['seed']),
    jsonb_build_object('full_name', p_full_name),
    now(), now()
  ) on conflict (id) do nothing;

  insert into public.profiles (
    id, full_name, avatar_url, location, timezone, role_type,
    skills, industries, startup_stage, looking_for, weekly_hours, bio,
    proof_of_work, past_projects, working_style, commitment_level,
    open_to_remote, open_to_in_person, verified
  )
  values (
    p_id, p_full_name, null, p_location, p_timezone, p_role_type,
    p_skills, p_industries, p_startup_stage, p_looking_for, p_weekly_hours, p_bio,
    p_proof_of_work, p_past_projects, p_working_style, p_commitment,
    p_open_remote, p_open_in_person, p_verified
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    location = excluded.location,
    timezone = excluded.timezone,
    role_type = excluded.role_type,
    skills = excluded.skills,
    industries = excluded.industries,
    startup_stage = excluded.startup_stage,
    looking_for = excluded.looking_for,
    weekly_hours = excluded.weekly_hours,
    bio = excluded.bio,
    proof_of_work = excluded.proof_of_work,
    past_projects = excluded.past_projects,
    working_style = excluded.working_style,
    commitment_level = excluded.commitment_level,
    open_to_remote = excluded.open_to_remote,
    open_to_in_person = excluded.open_to_in_person,
    verified = excluded.verified;
end $$;


-- 1. Three Ask authors -----------------------------------------------

-- Ayaan — Community Member (level 3)
select public._seed_demo_builder(
  '00000000-0000-0000-0000-00000000ab01'::uuid,
  'ayaan@buildtogether.demo',
  'Ayaan',
  'Toronto, Canada', 'EST',
  'product'::role_type,
  array['Product design','User research','Growth'],
  array['Consumer','Faith / Community'],
  'building'::startup_stage,
  array['collaborator','project_team']::looking_for_kind[],
  20::smallint,
  'Building a new builder/community platform. Shipping fast and asking for help out loud.',
  '[]'::jsonb,
  '[]'::jsonb,
  'async_first'::working_style,
  'part_time'::commitment_level,
  true, true, true
);
update public.profiles set level = 3 where id = '00000000-0000-0000-0000-00000000ab01';

-- Mariam — Contributor (level 2)
select public._seed_demo_builder(
  '00000000-0000-0000-0000-00000000ab02'::uuid,
  'mariam@buildtogether.demo',
  'Mariam',
  'London, UK', 'GMT',
  'business'::role_type,
  array['Growth','SEO / content','Sales'],
  array['B2B SaaS','Creator economy'],
  'has_idea'::startup_stage,
  array['collaborator','sprint_team']::looking_for_kind[],
  10::smallint,
  'Writing about builder prototypes and looking for honest feedback before posting.',
  '[]'::jsonb,
  '[]'::jsonb,
  'mixed'::working_style,
  'side_project'::commitment_level,
  true, false, false
);
update public.profiles set level = 2 where id = '00000000-0000-0000-0000-00000000ab02';

-- Yusuf — New User (level 1)
select public._seed_demo_builder(
  '00000000-0000-0000-0000-00000000ab03'::uuid,
  'yusuf@buildtogether.demo',
  'Yusuf',
  'NYC, USA', 'EST',
  'technical'::role_type,
  array['React / Next.js','TypeScript','Backend / APIs'],
  array['Education','Productivity'],
  'exploring'::startup_stage,
  array['sprint_team']::looking_for_kind[],
  8::smallint,
  'Student exploring whether to build a serious-collaborator tool. Doing the homework.',
  '[]'::jsonb,
  '[]'::jsonb,
  'async_first'::working_style,
  'exploring'::commitment_level,
  true, false, false
);
update public.profiles set level = 1 where id = '00000000-0000-0000-0000-00000000ab03';


-- 2. The three featured asks -----------------------------------------
delete from public.asks where id in (
  '00000000-0000-0000-0000-0000000ac001'::uuid,
  '00000000-0000-0000-0000-0000000ac002'::uuid,
  '00000000-0000-0000-0000-0000000ac003'::uuid
);

insert into public.asks (
  id, author_id, title, body, kind, audience, est_minutes, deadline
) values
  (
    '00000000-0000-0000-0000-0000000ac001',
    '00000000-0000-0000-0000-00000000ab01',
    'Roast my landing page before I send it to users',
    $$I''m testing a new builder/community platform and need brutal feedback before sharing it more widely.

What I''d love you to look at:
• Clarity — does the page tell you what this is in 10 seconds?
• Trust — does it feel real or vibes-only?
• Visual hierarchy — what catches your eye first?
• The CTA — would you actually try it?

Be honest. Don''t soften it.$$,
    'website_roast', 'open',
    10::smallint,
    (current_date + interval '5 days')::date
  ),
  (
    '00000000-0000-0000-0000-0000000ac002',
    '00000000-0000-0000-0000-00000000ab02',
    'Help me sharpen this LinkedIn launch post',
    $$I''m writing about a prototype I built and want the post to feel clear, not cringe, and worth engaging with.

What I need:
• Review the hook — does the first line make you stop scrolling?
• Tell me if the idea lands — do you get what I built?
• Suggest what would make you comment or share — not generic, real reasons.

Not looking for engagement-farming tactics. Looking for a post my technical friends would respect.$$,
    'review_post', 'open',
    7::smallint,
    null
  ),
  (
    '00000000-0000-0000-0000-0000000ac003',
    '00000000-0000-0000-0000-00000000ab03',
    'How would you validate this before building more?',
    $$I''m exploring a tool that helps students find collaborators for serious projects (not group-chat homework, real builds).

I''m torn on the next step:
• 10 student interviews?
• A landing page with email capture?
• A small 7-day sprint with a few people?

What would you do first? And what''s the question I''m not asking?$$,
    'idea_feedback', 'open',
    5::smallint,
    null
  );


-- Cleanup helper
drop function public._seed_demo_builder(
  uuid, text, text, text, text, role_type, text[], text[],
  startup_stage, looking_for_kind[], smallint, text, jsonb, jsonb,
  working_style, commitment_level, boolean, boolean, boolean
);
