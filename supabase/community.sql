-- =====================================================================
-- Build Together — community migration
-- Adds the Summit Participant badge kind. Idempotent.
-- Run AFTER platform.sql.
-- =====================================================================

alter type badge_kind add value if not exists 'summit_participant';
