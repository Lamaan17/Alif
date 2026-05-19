-- =====================================================================
-- Build Together — demo seed data (8 fake builder profiles)
-- Run AFTER schema.sql and discovery.sql. Idempotent.
--
-- These users have stable UUIDs in the 00000000-0000-0000-0000-deadbeef00xx
-- range and email "*@buildtogether.demo". They can't sign in (no password),
-- they exist only to populate the /builders discovery page.
--
-- To remove all demo data later:
--   delete from auth.users where email like '%@buildtogether.demo';
-- (profiles + interests + invitations cascade automatically.)
-- =====================================================================

-- Helper: create an auth.users row + profile in one call.
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
language plpgsql
security definer
as $$
begin
  insert into auth.users (
    id, instance_id, aud, role, email,
    encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at
  )
  values (
    p_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    p_email,
    '',
    now(),
    jsonb_build_object('provider', 'seed', 'providers', array['seed']),
    jsonb_build_object('full_name', p_full_name),
    now(),
    now()
  )
  on conflict (id) do nothing;

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

-- 1. Yusra Ahmed — Technical, Toronto, verified
select public._seed_demo_builder(
  '00000000-0000-0000-0000-00000000aa01'::uuid,
  'yusra@buildtogether.demo',
  'Yusra Ahmed',
  'Toronto, Canada',
  'EST',
  'technical'::role_type,
  array['React / Next.js','TypeScript','Node.js','Backend / APIs','LLM tooling'],
  array['Developer tools','AI / ML','Productivity'],
  'has_idea'::startup_stage,
  array['cofounder','sprint_team']::looking_for_kind[],
  20::smallint,
  'Ex-Stripe eng, building tools for community organizers. Strong opinions on async-first teams. Done with B2B SaaS, looking for something with soul.',
  '[{"label":"GitHub","url":"https://github.com/example"},{"label":"Twitter","url":"https://twitter.com/example"}]'::jsonb,
  '[{"name":"NotionLite","link":"https://example.com/notionlite","description":"Open-source Notion clone, 4k GitHub stars. Built solo in 6 months."},{"name":"Stripe Atlas internals","link":"","description":"Led the team that rewrote Atlas onboarding. Cut TTFB by 60%."}]'::jsonb,
  'async_first'::working_style,
  'part_time'::commitment_level,
  true, true, true
);

-- 2. Marcus Chen — Product, Singapore
select public._seed_demo_builder(
  '00000000-0000-0000-0000-00000000aa02'::uuid,
  'marcus@buildtogether.demo',
  'Marcus Chen',
  'Singapore',
  'GMT+8',
  'product'::role_type,
  array['Product management','User research','Growth','SEO / content'],
  array['B2B SaaS','Productivity','Creator economy'],
  'building'::startup_stage,
  array['cofounder']::looking_for_kind[],
  25::smallint,
  'Two-time PM at growth-stage startups (Notion, Linear). Looking for a technical cofounder who has equally strong opinions about the boring parts of B2B.',
  '[{"label":"LinkedIn","url":"https://linkedin.com/in/example"},{"label":"Personal site","url":"https://marcus.example.com"}]'::jsonb,
  '[{"name":"Linear → Linear Insights","link":"","description":"Owned the analytics module from 0 → 1, now used by 40% of paid teams."}]'::jsonb,
  'mixed'::working_style,
  'part_time'::commitment_level,
  true, true, false
);

-- 3. Amani Diallo — Design, Lagos
select public._seed_demo_builder(
  '00000000-0000-0000-0000-00000000aa03'::uuid,
  'amani@buildtogether.demo',
  'Amani Diallo',
  'Lagos, Nigeria',
  'GMT+1',
  'design'::role_type,
  array['Product design','Brand design','Motion / 3D','Product research'],
  array['Consumer','Creator economy','Media'],
  'exploring'::startup_stage,
  array['collaborator','sprint_team']::looking_for_kind[],
  10::smallint,
  'Designer who started as an illustrator. Best work is at the intersection of brand and product — I think they''re the same thing. Open to short sprints to find the right team.',
  '[{"label":"Dribbble","url":"https://dribbble.com/example"},{"label":"Are.na","url":"https://are.na/example"}]'::jsonb,
  '[{"name":"Glow (acquired)","link":"","description":"Co-designed Glow, a journaling app acquired in 2024. Led brand and product."}]'::jsonb,
  'async_first'::working_style,
  'side_project'::commitment_level,
  true, false, false
);

-- 4. Sara Martinez — Business, Buenos Aires, verified
select public._seed_demo_builder(
  '00000000-0000-0000-0000-00000000aa04'::uuid,
  'sara@buildtogether.demo',
  'Sara Martinez',
  'Buenos Aires, Argentina',
  'GMT-3',
  'business'::role_type,
  array['Sales','Partnerships','Operations','Growth'],
  array['Fintech','Marketplaces','Logistics'],
  'has_idea'::startup_stage,
  array['cofounder']::looking_for_kind[],
  35::smallint,
  'Built sales orgs from scratch at 3 LatAm fintechs. Have a thesis on cross-border SMB payments that I want to test. Need a technical cofounder who actually likes hard infra.',
  '[{"label":"LinkedIn","url":"https://linkedin.com/in/example"}]'::jsonb,
  '[{"name":"Ualá → SMB","link":"","description":"Launched and scaled the SMB segment from 0 to $4M ARR in 14 months."}]'::jsonb,
  'sync_heavy'::working_style,
  'full_time'::commitment_level,
  true, true, true
);

-- 5. Idris Khan — Operator, London
select public._seed_demo_builder(
  '00000000-0000-0000-0000-00000000aa05'::uuid,
  'idris@buildtogether.demo',
  'Idris Khan',
  'London, UK',
  'GMT',
  'operator'::role_type,
  array['Operations','Finance','Sales','Partnerships','Legal'],
  array['B2B SaaS','Marketplaces','Real estate'],
  'launched'::startup_stage,
  array['project_team','collaborator']::looking_for_kind[],
  15::smallint,
  'Ex-COO at a Y23 batch company (acquired). Currently running an indie marketplace at $30k MRR. Open to advising or low-key cofounder roles where my last decade actually helps.',
  '[{"label":"Twitter","url":"https://twitter.com/example"}]'::jsonb,
  '[{"name":"Plot (acquired)","link":"","description":"Built the COO function from seed to acquisition. Hired 24 people."},{"name":"Yardstick","link":"","description":"Running solo. £30k MRR. Niche B2B marketplace."}]'::jsonb,
  'mixed'::working_style,
  'side_project'::commitment_level,
  true, true, false
);

-- 6. Leila Hosseini — Domain Expert (healthcare), Berlin, verified
select public._seed_demo_builder(
  '00000000-0000-0000-0000-00000000aa06'::uuid,
  'leila@buildtogether.demo',
  'Leila Hosseini',
  'Berlin, Germany',
  'CET',
  'domain_expert'::role_type,
  array['User research','Product management','Operations'],
  array['Healthtech','AI / ML','Biotech'],
  'building'::startup_stage,
  array['cofounder','sprint_team']::looking_for_kind[],
  20::smallint,
  'MD turned product. Spent 6 years in clinical practice, now obsessed with the gap between what doctors need and what health tech ships. Looking for a builder who can move fast through regulated space.',
  '[{"label":"Personal site","url":"https://leila.example.com"},{"label":"Substack","url":"https://example.substack.com"}]'::jsonb,
  '[{"name":"Charta","link":"","description":"Building an LLM-based clinical note assistant. 3 hospitals piloting."}]'::jsonb,
  'async_first'::working_style,
  'part_time'::commitment_level,
  true, true, true
);

-- 7. Tomás Rivera — Technical (ML), Madrid
select public._seed_demo_builder(
  '00000000-0000-0000-0000-00000000aa07'::uuid,
  'tomas@buildtogether.demo',
  'Tomás Rivera',
  'Madrid, Spain',
  'CET',
  'technical'::role_type,
  array['Python','ML / AI','LLM tooling','Computer vision','Data engineering'],
  array['AI / ML','Developer tools','Robotics'],
  'exploring'::startup_stage,
  array['sprint_team','collaborator']::looking_for_kind[],
  8::smallint,
  'ML eng at a vision-first startup. Itching to build something small over a sprint. Bonus points if it involves embedded or hardware.',
  '[{"label":"GitHub","url":"https://github.com/example"},{"label":"Hugging Face","url":"https://huggingface.co/example"}]'::jsonb,
  '[{"name":"OpenCue (OSS)","link":"","description":"Co-maintainer of a small CV library, ~600 stars."}]'::jsonb,
  'async_first'::working_style,
  'exploring'::commitment_level,
  true, false, false
);

-- 8. Aaliyah Banks — Business + Product, NYC, verified
select public._seed_demo_builder(
  '00000000-0000-0000-0000-00000000aa08'::uuid,
  'aaliyah@buildtogether.demo',
  'Aaliyah Banks',
  'New York City, USA',
  'EST',
  'business'::role_type,
  array['Growth','Partnerships','Product management','Sales','User research'],
  array['Consumer','Creator economy','Faith / Community','Education'],
  'has_idea'::startup_stage,
  array['cofounder','sprint_team']::looking_for_kind[],
  30::smallint,
  'Built community at three consumer companies. Now building something for ALIF-style faith communities. Looking for a technical cofounder who cares about the people side as much as the product side.',
  '[{"label":"Twitter","url":"https://twitter.com/example"},{"label":"Newsletter","url":"https://example.substack.com"}]'::jsonb,
  '[{"name":"Patreon → Communities","link":"","description":"Led the community product line through public IPO."},{"name":"Niyyah (in progress)","link":"","description":"Stealth — building tools for mosque communities. 12 beta orgs."}]'::jsonb,
  'mixed'::working_style,
  'full_time'::commitment_level,
  true, true, true
);

-- Drop the helper so nothing lingers in the schema.
drop function public._seed_demo_builder(
  uuid, text, text, text, text, role_type, text[], text[],
  startup_stage, looking_for_kind[], smallint, text, jsonb, jsonb,
  working_style, commitment_level, boolean, boolean, boolean
);
