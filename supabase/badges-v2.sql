-- =====================================================================
-- Build Together — badge + ask schema bump
-- Run AFTER asks.sql + passport.sql. Idempotent.
-- =====================================================================

-- New badge kinds (separate from access tier; pure participation signal)
alter type badge_kind add value if not exists 'alifers_member';
alter type badge_kind add value if not exists 'mvp_tester';
alter type badge_kind add value if not exists 'website_roasted';
alter type badge_kind add value if not exists 'community_ask_answered';
alter type badge_kind add value if not exists 'project_helper';
alter type badge_kind add value if not exists 'build_sprint_host';

-- New ask kinds (UI categories; visibility/answer-gating still via audience)
alter type ask_kind add value if not exists 'review_post';
alter type ask_kind add value if not exists 'idea_feedback';
alter type ask_kind add value if not exists 'find_users';
alter type ask_kind add value if not exists 'design_help';
alter type ask_kind add value if not exists 'code_help';
alter type ask_kind add value if not exists 'pricing_check';

-- Optional ask metadata: estimated time + soft deadline
alter table public.asks
  add column if not exists est_minutes smallint check (est_minutes is null or (est_minutes > 0 and est_minutes <= 240));

alter table public.asks
  add column if not exists deadline date;
