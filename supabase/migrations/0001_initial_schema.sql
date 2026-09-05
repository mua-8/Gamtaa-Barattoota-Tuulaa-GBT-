-- ============================================================================
-- GBT Phase 2 — initial schema
-- Targets Supabase (Postgres + auth + storage schemas + anon/authenticated/
-- service_role roles). Run via `supabase db push` or the SQL editor.
-- ============================================================================

-- ── Enums ──────────────────────────────────────────────────────────────────
do $$ begin
  create type public.user_role as enum ('student', 'admin', 'super_admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.application_status as enum
    ('pending', 'under_review', 'approved', 'rejected', 'suspended');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.contact_message_status as enum
    ('new', 'read', 'replied', 'archived');
exception when duplicate_object then null; end $$;

-- ── Helper: updated_at ─────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ── profiles ───────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text not null unique,
  full_name  text,
  role       public.user_role not null default 'student',
  avatar_url text,
  phone      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile row whenever an auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.raw_user_meta_data ->> 'phone'
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Role helpers (security definer to avoid RLS recursion) ─────────────────
create or replace function public.my_role()
returns public.user_role
language sql stable security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select coalesce(public.my_role() in ('admin', 'super_admin'), false);
$$;

-- ── student_profiles ───────────────────────────────────────────────────────
create table if not exists public.student_profiles (
  id               uuid primary key default gen_random_uuid(),
  profile_id       uuid not null unique references public.profiles (id) on delete cascade,
  gender           text,
  date_of_birth    date,
  phone            text,
  current_location text,
  home_community   text,
  university       text,
  faculty          text,
  department       text,
  year_of_study    text,
  student_id       text,
  bio              text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create trigger student_profiles_updated_at
  before update on public.student_profiles
  for each row execute function public.set_updated_at();

-- ── student_skills ─────────────────────────────────────────────────────────
create table if not exists public.student_skills (
  id                 uuid primary key default gen_random_uuid(),
  student_profile_id uuid not null references public.student_profiles (id) on delete cascade,
  skill              text not null,
  created_at         timestamptz not null default now(),
  unique (student_profile_id, skill)
);

create or replace function public.owns_student_profile(sp_id uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.student_profiles
    where id = sp_id and profile_id = auth.uid()
  );
$$;

-- ── applications ───────────────────────────────────────────────────────────
create sequence if not exists public.application_number_seq;

create table if not exists public.applications (
  id                   uuid primary key default gen_random_uuid(),
  student_profile_id   uuid not null references public.student_profiles (id) on delete cascade,
  application_number   text unique,
  motivation           text not null,
  teaching_experience  text,
  availability_start   date,
  availability_end     date,
  preferred_location   text,
  preferred_service_areas text[],
  subjects             text[],
  education_levels     text[],
  status               public.application_status not null default 'pending',
  submitted_at         timestamptz not null default now(),
  reviewed_at          timestamptz,
  reviewed_by          uuid references public.profiles (id)
);

-- Assign GBT-APP-YYYY-NNNN numbers atomically on insert.
create or replace function public.assign_application_number()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.application_number is null then
    new.application_number :=
      'GBT-APP-' || to_char(new.submitted_at, 'YYYY') || '-' ||
      lpad(nextval('public.application_number_seq')::text, 4, '0');
  end if;
  return new;
end $$;

drop trigger if exists applications_assign_number on public.applications;
create trigger applications_assign_number
  before insert on public.applications
  for each row execute function public.assign_application_number();

-- ── contact_messages ───────────────────────────────────────────────────────
create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  subject    text not null,
  message    text not null,
  status     public.contact_message_status not null default 'new',
  created_at timestamptz not null default now()
);

-- ============================================================================
-- Row Level Security
-- ============================================================================

alter table public.profiles        enable row level security;
alter table public.student_profiles enable row level security;
alter table public.student_skills  enable row level security;
alter table public.applications    enable row level security;
alter table public.contact_messages enable row level security;

-- profiles: owners and admins read; only the owner (or service role) writes.
-- The WITH CHECK on update also blocks self role escalation.
drop policy if exists profiles_select_own_or_admin on public.profiles;
create policy profiles_select_own_or_admin on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update using (id = auth.uid())
  with check (id = auth.uid() and role = (select p.role from public.profiles p where p.id = auth.uid()));

drop policy if exists profiles_admin_update on public.profiles;
create policy profiles_admin_update on public.profiles
  for update using (public.is_admin()) with check (public.is_admin());

-- student_profiles: strictly private to the owner (+ admins).
drop policy if exists student_profiles_select_own on public.student_profiles;
create policy student_profiles_select_own on public.student_profiles
  for select using (profile_id = auth.uid() or public.is_admin());

drop policy if exists student_profiles_insert_own on public.student_profiles;
create policy student_profiles_insert_own on public.student_profiles
  for insert with check (profile_id = auth.uid());

drop policy if exists student_profiles_update_own on public.student_profiles;
create policy student_profiles_update_own on public.student_profiles
  for update using (profile_id = auth.uid() or public.is_admin())
  with check (profile_id = auth.uid() or public.is_admin());

-- student_skills: private via owning student profile.
drop policy if exists student_skills_select_own on public.student_skills;
create policy student_skills_select_own on public.student_skills
  for select using (public.owns_student_profile(student_profile_id) or public.is_admin());

drop policy if exists student_skills_insert_own on public.student_skills;
create policy student_skills_insert_own on public.student_skills
  for insert with check (public.owns_student_profile(student_profile_id));

drop policy if exists student_skills_delete_own on public.student_skills;
create policy student_skills_delete_own on public.student_skills
  for delete using (public.owns_student_profile(student_profile_id));

-- applications: owners read/submit; only admins review.
drop policy if exists applications_select_own on public.applications;
create policy applications_select_own on public.applications
  for select using (
    public.owns_student_profile(student_profile_id) or public.is_admin()
  );

drop policy if exists applications_insert_own on public.applications;
create policy applications_insert_own on public.applications
  for insert with check (
    public.owns_student_profile(student_profile_id) and status = 'pending'
  );

drop policy if exists applications_update_admin on public.applications;
create policy applications_update_admin on public.applications
  for update using (public.is_admin()) with check (public.is_admin());

-- contact_messages: written by the service role only (bypasses RLS);
-- admins may read/manage.
drop policy if exists contact_messages_admin_select on public.contact_messages;
create policy contact_messages_admin_select on public.contact_messages
  for select using (public.is_admin());

drop policy if exists contact_messages_admin_update on public.contact_messages;
create policy contact_messages_admin_update on public.contact_messages
  for update using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- Storage buckets & policies
-- ============================================================================

insert into storage.buckets (id, name, public) values
  ('avatars',        'avatars',        true),
  ('gallery',        'gallery',        true),
  ('team-photos',    'team-photos',    true),
  ('program-images', 'program-images', true)
on conflict (id) do nothing;

-- Avatars: anyone can view; owners manage files inside their own folder.
drop policy if exists avatars_public_read on storage.objects;
create policy avatars_public_read on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists avatars_insert_own_folder on storage.objects;
create policy avatars_insert_own_folder on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists avatars_update_own_folder on storage.objects;
create policy avatars_update_own_folder on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists avatars_delete_own_folder on storage.objects;
create policy avatars_delete_own_folder on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- Content buckets: public read, admin write.
drop policy if exists content_public_read on storage.objects;
create policy content_public_read on storage.objects
  for select using (bucket_id in ('gallery', 'team-photos', 'program-images'));

drop policy if exists content_admin_write on storage.objects;
create policy content_admin_write on storage.objects
  for insert to authenticated
  with check (
    bucket_id in ('gallery', 'team-photos', 'program-images')
    and public.is_admin()
  );

drop policy if exists content_admin_update on storage.objects;
create policy content_admin_update on storage.objects
  for update to authenticated
  using (bucket_id in ('gallery', 'team-photos', 'program-images') and public.is_admin());

drop policy if exists content_admin_delete on storage.objects;
create policy content_admin_delete on storage.objects
  for delete to authenticated
  using (bucket_id in ('gallery', 'team-photos', 'program-images') and public.is_admin());

-- ============================================================================
-- Grants (Supabase API roles)
-- ============================================================================
grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.student_profiles to authenticated;
grant select, insert, delete on public.student_skills to authenticated;
grant select, insert, update on public.applications to authenticated;
grant select, update on public.contact_messages to authenticated;
