-- Add deactivation support to profiles
-- Run this in Supabase SQL editor, or via the Supabase CLI.

alter table public.profiles
  add column if not exists deactivated_at timestamptz;

create index if not exists profiles_deactivated_idx
  on public.profiles(deactivated_at)
  where deactivated_at is not null;

-- Allow admins to update + delete profiles (if RLS is enforced elsewhere)
-- Safe to re-run.
drop policy if exists "profiles admin update" on public.profiles;
create policy "profiles admin update"
  on public.profiles
  for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "profiles admin delete" on public.profiles;
create policy "profiles admin delete"
  on public.profiles
  for delete
  using (public.is_admin());
