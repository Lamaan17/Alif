-- =====================================================================
-- Build Together — platform demo data
-- Run AFTER schema.sql, discovery.sql, platform.sql, and seed.sql.
-- Idempotent — re-running upserts.
--
-- Adds:
--  - 4 more demo builder profiles (total demo set = 12)
--  - assorted badges + levels on existing demo users
--  - 5 demo projects
--  - 3 demo sprints (including the showcase "7-Day Founder Chemistry Sprint")
--  - sample interests (some mutual = matches)
--  - sample applications on projects and sprints
--
-- To remove all demo data:
--   delete from auth.users where email like '%@buildtogether.demo';
-- =====================================================================

-- 0. Re-create the seed helper (drop happens at end of seed.sql; we
--    redefine here so this file is independent.)
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
    id, instance_id, aud, role, email,
    encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at
  )
  values (
    p_id, '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', p_email, '',
    now(),
    jsonb_build_object('provider','seed','providers', array['seed']),
    jsonb_build_object('full_name', p_full_name),
    now(), now()
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


-- 1. Four more demo builders (#9–#12) -------------------------------

-- 9. Amir Saleem — Technical, Karachi (Pakistan)
select public._seed_demo_builder(
  '00000000-0000-0000-0000-00000000aa09'::uuid,
  'amir@buildtogether.demo',
  'Amir Saleem',
  'Karachi, Pakistan',
  'GMT+5',
  'technical'::role_type,
  array['React / Next.js','Python','ML / AI','LLM tooling','Backend / APIs'],
  array['AI / ML','Education','Productivity'],
  'building'::startup_stage,
  array['cofounder','sprint_team']::looking_for_kind[],
  18::smallint,
  'Self-taught full-stack from Karachi, two years deep into AI tooling. Building a study companion for Pakistani students prepping for international exams. Want a product-minded cofounder.',
  '[{"label":"GitHub","url":"https://github.com/example"},{"label":"Live product","url":"https://example.com"}]'::jsonb,
  '[{"name":"PathFinder","link":"","description":"AI-powered exam prep app. 3,000 weekly active students."}]'::jsonb,
  'async_first'::working_style,
  'part_time'::commitment_level,
  true, true, false
);

-- 10. Hana Yusuf — Product, Dubai (UAE), verified
select public._seed_demo_builder(
  '00000000-0000-0000-0000-00000000aa10'::uuid,
  'hana@buildtogether.demo',
  'Hana Yusuf',
  'Dubai, UAE',
  'GMT+4',
  'product'::role_type,
  array['Product management','User research','Growth','Partnerships','Sales'],
  array['Consumer','Marketplaces','Faith / Community','Education'],
  'has_idea'::startup_stage,
  array['cofounder']::looking_for_kind[],
  30::smallint,
  'Built three products at MENA growth-stage startups. Thesis on community-led commerce for Muslim families. Looking for a technical cofounder who can prototype fast and ships in public.',
  '[{"label":"LinkedIn","url":"https://linkedin.com/in/example"},{"label":"Substack","url":"https://example.substack.com"}]'::jsonb,
  '[{"name":"Talabat → ramadanyat","link":"","description":"Led launch of seasonal Ramadan vertical, 40% lift in MAU."},{"name":"Halalbox (acquired)","link":"","description":"Co-founded marketplace, acquired in 2023."}]'::jsonb,
  'sync_heavy'::working_style,
  'full_time'::commitment_level,
  true, true, true
);

-- 11. Zayd Khaled — Design, Cairo (Egypt)
select public._seed_demo_builder(
  '00000000-0000-0000-0000-00000000aa11'::uuid,
  'zayd@buildtogether.demo',
  'Zayd Khaled',
  'Cairo, Egypt',
  'GMT+2',
  'design'::role_type,
  array['Product design','Brand design','Motion / 3D','User research'],
  array['Consumer','Creator economy','Faith / Community','Media'],
  'exploring'::startup_stage,
  array['collaborator','sprint_team','project_team']::looking_for_kind[],
  12::smallint,
  'Designer at the intersection of Islamic art tradition and modern product. Senior at a regional studio, looking for the right team to start something my grandparents would recognize but my friends would use daily.',
  '[{"label":"Dribbble","url":"https://dribbble.com/example"},{"label":"Behance","url":"https://behance.net/example"},{"label":"Are.na","url":"https://are.na/example"}]'::jsonb,
  '[{"name":"Wird","link":"","description":"Co-designed a meditation app for the MENA market. 50k MAU."}]'::jsonb,
  'mixed'::working_style,
  'side_project'::commitment_level,
  true, true, false
);

-- 12. Khadija Sayed — Business, Houston, verified
select public._seed_demo_builder(
  '00000000-0000-0000-0000-00000000aa12'::uuid,
  'khadija@buildtogether.demo',
  'Khadija Sayed',
  'Houston, USA',
  'CST',
  'business'::role_type,
  array['Sales','Operations','Partnerships','Finance','Growth'],
  array['Healthtech','Fintech','Faith / Community','B2B SaaS'],
  'has_idea'::startup_stage,
  array['cofounder','project_team']::looking_for_kind[],
  25::smallint,
  'First-gen Pakistani-American, ex-McKinsey, now four years operating at a healthtech series-B. Specific thesis on culturally-competent mental health tools for Muslim Americans. Need a technical cofounder who actually cares about this user.',
  '[{"label":"LinkedIn","url":"https://linkedin.com/in/example"}]'::jsonb,
  '[{"name":"Hims & Hers → enterprise","link":"","description":"Built and scaled the enterprise sales motion from zero."}]'::jsonb,
  'mixed'::working_style,
  'full_time'::commitment_level,
  true, true, true
);


-- 2. Levels — bump the more-experienced demo users -----------------
-- (Level 1 = profile created. We elevate a handful for the demo to make
--  the Founder Circle page non-empty.)
update public.profiles set level = 3 where id in (
  '00000000-0000-0000-0000-00000000aa01'::uuid, -- Yusra
  '00000000-0000-0000-0000-00000000aa04'::uuid, -- Sara
  '00000000-0000-0000-0000-00000000aa06'::uuid  -- Leila
);
update public.profiles set level = 4 where id in (
  '00000000-0000-0000-0000-00000000aa10'::uuid, -- Hana
  '00000000-0000-0000-0000-00000000aa12'::uuid  -- Khadija
);
update public.profiles set level = 2 where id in (
  '00000000-0000-0000-0000-00000000aa02'::uuid, -- Marcus
  '00000000-0000-0000-0000-00000000aa08'::uuid, -- Aaliyah
  '00000000-0000-0000-0000-00000000aa09'::uuid  -- Amir
);
-- All others remain at default 1.


-- 3. Badges ----------------------------------------------------------
delete from public.profile_badges where profile_id in (
  '00000000-0000-0000-0000-00000000aa01'::uuid,
  '00000000-0000-0000-0000-00000000aa02'::uuid,
  '00000000-0000-0000-0000-00000000aa04'::uuid,
  '00000000-0000-0000-0000-00000000aa06'::uuid,
  '00000000-0000-0000-0000-00000000aa08'::uuid,
  '00000000-0000-0000-0000-00000000aa09'::uuid,
  '00000000-0000-0000-0000-00000000aa10'::uuid,
  '00000000-0000-0000-0000-00000000aa12'::uuid
);

insert into public.profile_badges (profile_id, kind) values
  ('00000000-0000-0000-0000-00000000aa01', 'sprint_finisher'),
  ('00000000-0000-0000-0000-00000000aa01', 'mentor_endorsed'),
  ('00000000-0000-0000-0000-00000000aa01', 'event_attendee'),
  ('00000000-0000-0000-0000-00000000aa02', 'cohort_member'),
  ('00000000-0000-0000-0000-00000000aa02', 'active_collaborator'),
  ('00000000-0000-0000-0000-00000000aa04', 'sprint_finisher'),
  ('00000000-0000-0000-0000-00000000aa04', 'mentor_endorsed'),
  ('00000000-0000-0000-0000-00000000aa04', 'cohort_member'),
  ('00000000-0000-0000-0000-00000000aa06', 'sprint_finisher'),
  ('00000000-0000-0000-0000-00000000aa06', 'event_attendee'),
  ('00000000-0000-0000-0000-00000000aa08', 'active_collaborator'),
  ('00000000-0000-0000-0000-00000000aa08', 'event_attendee'),
  ('00000000-0000-0000-0000-00000000aa09', 'active_collaborator'),
  ('00000000-0000-0000-0000-00000000aa10', 'mentor_endorsed'),
  ('00000000-0000-0000-0000-00000000aa10', 'sprint_finisher'),
  ('00000000-0000-0000-0000-00000000aa10', 'cohort_member'),
  ('00000000-0000-0000-0000-00000000aa12', 'mentor_endorsed'),
  ('00000000-0000-0000-0000-00000000aa12', 'sprint_finisher'),
  ('00000000-0000-0000-0000-00000000aa12', 'event_attendee')
on conflict (profile_id, kind) do nothing;


-- 4. Projects --------------------------------------------------------
-- Wipe and re-insert with stable ids so re-run is idempotent.
delete from public.projects where id in (
  '00000000-0000-0000-0000-0000000bb001'::uuid,
  '00000000-0000-0000-0000-0000000bb002'::uuid,
  '00000000-0000-0000-0000-0000000bb003'::uuid,
  '00000000-0000-0000-0000-0000000bb004'::uuid,
  '00000000-0000-0000-0000-0000000bb005'::uuid
);

insert into public.projects (
  id, owner_id, title, one_liner, problem, industry, current_stage,
  skills_needed, ideal_collaborator, time_commitment_hours, duration_weeks,
  collab_mode, deadline
) values
  ('00000000-0000-0000-0000-0000000bb001',
   '00000000-0000-0000-0000-00000000aa01', -- Yusra
   'Quiet polls for online madrasas',
   'A lightweight tool teachers can drop into Zoom-based madrasa classes to take live polls without breaking flow.',
   'Online Islamic education is exploding, but the tools are awful. Teachers either share Google Forms (breaks attention) or yell into Zoom chat. We want polls that feel respectful of the classroom.',
   'Education',
   'has_idea',
   array['React / Next.js','Node.js','User research'],
   'technical',
   8, 6, 'remote',
   (current_date + interval '14 days')::date
  ),
  ('00000000-0000-0000-0000-0000000bb002',
   '00000000-0000-0000-0000-00000000aa04', -- Sara
   'Halal supply chain transparency',
   'Help small importers track and certify halal supply chains end-to-end.',
   'There''s no shared infrastructure for halal certification across border crossings — every importer rebuilds from scratch. Trust is local and expensive. We want to be the layer that travels with the product.',
   'Marketplaces',
   'building',
   array['Backend / APIs','Data engineering','Databases','Sales'],
   'technical',
   15, 12, 'hybrid',
   (current_date + interval '21 days')::date
  ),
  ('00000000-0000-0000-0000-0000000bb003',
   '00000000-0000-0000-0000-00000000aa02', -- Marcus
   'AI prayer time + qibla rebuild',
   'A new prayer-time app that actually respects user attention — fewer ads, real ML for adhan timing per location.',
   'The space has been dominated by ad-laden, design-poor apps for a decade. There''s a clear opportunity to ship the calm, useful version.',
   'Consumer',
   'building',
   array['iOS / Swift','Android / Kotlin','ML / AI','Product design'],
   'design',
   10, 8, 'remote',
   (current_date + interval '10 days')::date
  ),
  ('00000000-0000-0000-0000-0000000bb004',
   '00000000-0000-0000-0000-00000000aa08', -- Aaliyah
   'Mentor matching for Muslim grad students',
   'A clean matching layer between Muslim grad students and senior professionals who''ve done it before.',
   'Cold-emailing a senior alum is a coin flip. We want to make it a structured ask that produces 30-minute commitments, not endless "let''s grab coffee" threads.',
   'Education',
   'has_idea',
   array['React / Next.js','Product design','Backend / APIs','Growth'],
   'product',
   20, 10, 'remote',
   (current_date + interval '30 days')::date
  ),
  ('00000000-0000-0000-0000-0000000bb005',
   '00000000-0000-0000-0000-00000000aa10', -- Hana
   'Wedding planning for South Asian families',
   'A planning + budgeting marketplace built for the realities of South Asian / Muslim weddings — multi-event, multi-vendor, multi-generational.',
   'The TheKnot generation never built for our weddings. The events are bigger, the vendors are tighter-knit, the budgets are scattered across families. We''re building for that.',
   'Marketplaces',
   'exploring',
   array['React / Next.js','Product design','Growth','SEO / content'],
   'technical',
   12, 16, 'hybrid',
   (current_date + interval '28 days')::date
  );


-- 5. Sprints ---------------------------------------------------------
delete from public.sprints where id in (
  '00000000-0000-0000-0000-0000000cc001'::uuid,
  '00000000-0000-0000-0000-0000000cc002'::uuid,
  '00000000-0000-0000-0000-0000000cc003'::uuid
);

insert into public.sprints (
  id, title, theme, description, deliverable,
  start_date, end_date, max_team_size, recommended_roles
) values
  ('00000000-0000-0000-0000-0000000cc001',
   '7-Day Founder Chemistry Sprint',
   'Build a useful AI tool for students, founders, or small businesses.',
   $$The flagship sprint. Pairs builders into 2-3 person teams for one focused week. The goal isn't to ship a unicorn — it's to feel what working together is actually like before you commit to anything bigger.

You'll work async with one daily 20-minute sync. ALIF curates the team based on application + profile fit. Past cohorts have produced 3 funded teams.$$,
   'Landing page with 10 real signups, prototype, 5 customer interviews, 3-minute pitch video',
   (current_date + interval '7 days')::date,
   (current_date + interval '14 days')::date,
   3, array['technical','product','business']::role_type[]
  ),
  ('00000000-0000-0000-0000-0000000cc002',
   'Ramadan Toolkit Sprint',
   'Build something useful for Muslim families during Ramadan.',
   'Themed sprint that ran last Ramadan. Teams built tools to help families plan iftars, track ibadah, or share with extended family. Five teams shipped working MVPs; two are still maintained.',
   'Shipped MVP, 10 user interviews, retrospective write-up',
   (current_date - interval '90 days')::date,
   (current_date - interval '83 days')::date,
   3, array['technical','product','design']::role_type[]
  ),
  ('00000000-0000-0000-0000-0000000cc003',
   'Founder × Operator Sprint',
   'Pair a serious operator with a builder. Solve one nagging business problem.',
   'Ongoing live sprint. We paired three operators with technical builders to scratch a real business itch over a week. Less artifact-focused, more ''does this person make decisions like I do?''',
   'Working internal tool, written retro from both sides',
   (current_date - interval '2 days')::date,
   (current_date + interval '5 days')::date,
   2, array['operator','technical']::role_type[]
  );


-- 6. Matches: sample mutual interests --------------------------------
-- A few hand-built so /builders shows the "Mutual" pill out of the box.
insert into public.interests (from_user, to_user) values
  ('00000000-0000-0000-0000-00000000aa01','00000000-0000-0000-0000-00000000aa04'),
  ('00000000-0000-0000-0000-00000000aa04','00000000-0000-0000-0000-00000000aa01'),
  ('00000000-0000-0000-0000-00000000aa02','00000000-0000-0000-0000-00000000aa07'),
  ('00000000-0000-0000-0000-00000000aa07','00000000-0000-0000-0000-00000000aa02'),
  ('00000000-0000-0000-0000-00000000aa10','00000000-0000-0000-0000-00000000aa12'),
  ('00000000-0000-0000-0000-00000000aa12','00000000-0000-0000-0000-00000000aa10'),
  -- one-way (no match yet, just shows on Yusra's "received")
  ('00000000-0000-0000-0000-00000000aa09','00000000-0000-0000-0000-00000000aa01'),
  ('00000000-0000-0000-0000-00000000aa11','00000000-0000-0000-0000-00000000aa08')
on conflict do nothing;


-- 7. Applications ----------------------------------------------------
-- Project apps + sprint apps from demo builders.
-- Use deterministic ids so re-running upserts cleanly.

insert into public.applications (
  id, target_type, target_id, applicant_id, message, status
) values
  -- Amir applies to Yusra's madrasa project
  ('00000000-0000-0000-0000-0000000dd001', 'project',
   '00000000-0000-0000-0000-0000000bb001',
   '00000000-0000-0000-0000-00000000aa09',
   'I''ve built a polling tool in production already (PathFinder) — same shape, different audience. Happy to share the codebase as a starting point.',
   'pending'),

  -- Tomás applies to Sara's halal supply chain
  ('00000000-0000-0000-0000-0000000dd002', 'project',
   '00000000-0000-0000-0000-0000000bb002',
   '00000000-0000-0000-0000-00000000aa07',
   'Data eng background, four years in supply chain at a logistics startup. Want to talk about the certification graph model.',
   'pending'),

  -- Amani applies to Marcus's qibla rebuild
  ('00000000-0000-0000-0000-0000000dd003', 'project',
   '00000000-0000-0000-0000-0000000bb003',
   '00000000-0000-0000-0000-00000000aa03',
   'I''d kill to redesign this category. Have ideas I''ve been sitting on for years.',
   'accepted'),

  -- Zayd applies to Hana's wedding marketplace
  ('00000000-0000-0000-0000-0000000dd004', 'project',
   '00000000-0000-0000-0000-0000000bb005',
   '00000000-0000-0000-0000-00000000aa11',
   'The cultural fluency is the moat. I want to design the brand from day one.',
   'pending'),

  -- Sprint applications: chemistry sprint #1
  ('00000000-0000-0000-0000-0000000dd010', 'sprint',
   '00000000-0000-0000-0000-0000000cc001',
   '00000000-0000-0000-0000-00000000aa09',
   'Want to build the study companion thing as a single-week artifact with a product person.', 'pending'),
  ('00000000-0000-0000-0000-0000000dd011', 'sprint',
   '00000000-0000-0000-0000-0000000cc001',
   '00000000-0000-0000-0000-00000000aa02',
   'Looking for one builder to test out a B2B AI use case I''ve been sitting on.', 'pending'),
  ('00000000-0000-0000-0000-0000000dd012', 'sprint',
   '00000000-0000-0000-0000-0000000cc001',
   '00000000-0000-0000-0000-00000000aa08',
   'Curious if I can carry the GTM side without a heavy technical role on the team.', 'pending'),

  -- Sprint #2 (Ramadan, completed) — show finished applicants
  ('00000000-0000-0000-0000-0000000dd020', 'sprint',
   '00000000-0000-0000-0000-0000000cc002',
   '00000000-0000-0000-0000-00000000aa01', 'Joined last Ramadan with two others.', 'accepted'),
  ('00000000-0000-0000-0000-0000000dd021', 'sprint',
   '00000000-0000-0000-0000-0000000cc002',
   '00000000-0000-0000-0000-00000000aa06', 'Healthcare angle on Ramadan health tracking.', 'accepted'),

  -- Sprint #3 (live) — operators
  ('00000000-0000-0000-0000-0000000dd030', 'sprint',
   '00000000-0000-0000-0000-0000000cc003',
   '00000000-0000-0000-0000-00000000aa05', 'Operator side — would bring a real ops problem.', 'accepted'),
  ('00000000-0000-0000-0000-0000000dd031', 'sprint',
   '00000000-0000-0000-0000-0000000cc003',
   '00000000-0000-0000-0000-00000000aa07', 'Builder side, free this week.', 'accepted')
on conflict (target_type, target_id, applicant_id) do update set
  message = excluded.message,
  status  = excluded.status;


-- Cleanup
drop function public._seed_demo_builder(
  uuid, text, text, text, text, role_type, text[], text[],
  startup_stage, looking_for_kind[], smallint, text, jsonb, jsonb,
  working_style, commitment_level, boolean, boolean, boolean
);
