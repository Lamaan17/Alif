-- =====================================================================
-- Build Together — admin policy migration
-- Run AFTER schema.sql, discovery.sql, platform.sql. Idempotent.
-- Lets users with is_admin = true update or delete other users' profiles.
-- (Without this, the "profiles update own" policy blocks admin edits.)
-- =====================================================================

drop policy if exists "profiles admin update" on public.profiles;
create policy "profiles admin update"
  on public.profiles for update
  to authenticated
  using (
    exists (select 1 from public.profiles p2 where p2.id = auth.uid() and p2.is_admin)
  )
  with check (
    exists (select 1 from public.profiles p2 where p2.id = auth.uid() and p2.is_admin)
  );

drop policy if exists "profiles admin delete" on public.profiles;
create policy "profiles admin delete"
  on public.profiles for delete
  to authenticated
  using (
    exists (select 1 from public.profiles p2 where p2.id = auth.uid() and p2.is_admin)
  );
