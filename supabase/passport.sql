-- =====================================================================
-- Build Together — ALIF Passport badges
-- Adds the six ALIF-affiliation badge kinds. Idempotent.
-- Run AFTER platform.sql.
-- =====================================================================

alter type badge_kind add value if not exists 'sessions_participant';
alter type badge_kind add value if not exists 'network_member';
alter type badge_kind add value if not exists 'hq_visitor';
alter type badge_kind add value if not exists 'jumuah_attendee';
alter type badge_kind add value if not exists 'tournament_builder';
alter type badge_kind add value if not exists 'portfolio_contributor';
