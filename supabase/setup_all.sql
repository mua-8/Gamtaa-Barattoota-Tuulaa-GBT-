-- ============================================================
-- GBT FULL SETUP — run this entire file ONCE in the Supabase
-- SQL Editor (Dashboard → SQL Editor → New query → paste → Run).
-- Order: 0001 schema → 0002 student portal → seed data.
-- ============================================================

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

-- ============ PHASE 3 (0002) ============

-- ============================================================================
-- GBT Phase 3 — student dashboard, programs & service tracking
-- ============================================================================

-- ── Enums ──────────────────────────────────────────────────────────────────
do $$ begin
  create type public.program_status as enum
    ('draft', 'upcoming', 'active', 'completed', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.participant_status as enum
    ('registered', 'accepted', 'active', 'completed', 'withdrawn');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.verification_status as enum
    ('pending', 'verified', 'rejected');
exception when duplicate_object then null; end $$;

-- ── programs ───────────────────────────────────────────────────────────────
create table if not exists public.programs (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  slug           text not null unique,
  description    text,
  category       text,
  image_url      text,
  start_date     date,
  end_date       date,
  location       text,
  community_id   text,
  target_audience text,
  objectives     text[],
  requirements   text[],
  status         public.program_status not null default 'draft',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create trigger programs_updated_at
  before update on public.programs
  for each row execute function public.set_updated_at();

-- ── program_participants ───────────────────────────────────────────────────
create table if not exists public.program_participants (
  id           uuid primary key default gen_random_uuid(),
  program_id   uuid not null references public.programs (id) on delete cascade,
  student_id   uuid not null references public.profiles (id) on delete cascade,
  status       public.participant_status not null default 'registered',
  joined_at    timestamptz not null default now(),
  completed_at timestamptz,
  unique (program_id, student_id)
);

-- ── service_records ────────────────────────────────────────────────────────
create table if not exists public.service_records (
  id                  uuid primary key default gen_random_uuid(),
  student_id          uuid not null references public.profiles (id) on delete cascade,
  program_id          uuid references public.programs (id) on delete set null,
  date                date not null default current_date,
  activity            text not null,
  location            text,
  hours               numeric(5,2) not null check (hours > 0 and hours <= 24),
  description         text,
  verification_status public.verification_status not null default 'pending',
  verified_by         uuid references public.profiles (id),
  verified_at         timestamptz,
  created_at          timestamptz not null default now()
);

-- ── notifications ──────────────────────────────────────────────────────────
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  title      text not null,
  message    text,
  type       text not null default 'info',
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

-- ── certificates ───────────────────────────────────────────────────────────
create sequence if not exists public.certificate_number_seq;

create table if not exists public.certificates (
  id                  uuid primary key default gen_random_uuid(),
  student_id          uuid not null references public.profiles (id) on delete cascade,
  program_id          uuid references public.programs (id) on delete set null,
  certificate_number  text unique,
  service_hours       numeric(6,2),
  issued_at           timestamptz not null default now(),
  verification_status public.verification_status not null default 'verified',
  revoked_at          timestamptz
);

create or replace function public.assign_certificate_number()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.certificate_number is null then
    new.certificate_number :=
      'GBT-CERT-' || to_char(new.issued_at, 'YYYY') || '-' ||
      lpad(nextval('public.certificate_number_seq')::text, 4, '0');
  end if;
  return new;
end $$;

drop trigger if exists certificates_assign_number on public.certificates;
create trigger certificates_assign_number
  before insert on public.certificates
  for each row execute function public.assign_certificate_number();

-- ── student_profiles: editable availability ────────────────────────────────
alter table public.student_profiles
  add column if not exists availability_start date,
  add column if not exists availability_end date;

-- ============================================================================
-- Notification triggers (security definer: students never write notifications)
-- ============================================================================

create or replace function public.notify_user(
  uid uuid, title text, message text, type text default 'info'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (user_id, title, message, type)
  values (uid, title, message, type);
end $$;

-- Application approved / rejected
create or replace function public.notify_application_decision()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  owner uuid;
begin
  if new.status is distinct from old.status
     and new.status in ('approved', 'rejected') then
    select profile_id into owner
      from public.student_profiles where id = new.student_profile_id;
    if owner is not null then
      perform public.notify_user(
        owner,
        'Application ' || new.status,
        'Your application ' || coalesce(new.application_number, '') ||
          ' was ' || new.status || '.',
        'application'
      );
    end if;
  end if;
  return new;
end $$;

drop trigger if exists applications_notify_decision on public.applications;
create trigger applications_notify_decision
  after update on public.applications
  for each row execute function public.notify_application_decision();

-- Program enrollment accepted
create or replace function public.notify_enrollment_accepted()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'accepted' and new.status is distinct from old.status then
    perform public.notify_user(
      new.student_id,
      'Enrollment accepted',
      'You have been accepted into the program. See My Programs for details.',
      'program'
    );
  end if;
  return new;
end $$;

drop trigger if exists participants_notify_accepted on public.program_participants;
create trigger participants_notify_accepted
  after update on public.program_participants
  for each row execute function public.notify_enrollment_accepted();

-- Service record verified
create or replace function public.notify_service_verified()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.verification_status = 'verified'
     and new.verification_status is distinct from old.verification_status then
    perform public.notify_user(
      new.student_id,
      'Service record verified',
      new.hours || ' hours of service were verified. Great work!',
      'service'
    );
  end if;
  return new;
end $$;

drop trigger if exists service_records_notify_verified on public.service_records;
create trigger service_records_notify_verified
  after update on public.service_records
  for each row execute function public.notify_service_verified();

-- Certificate issued
create or replace function public.notify_certificate_issued()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.notify_user(
    new.student_id,
    'Certificate issued',
    'Certificate ' || coalesce(new.certificate_number, '') || ' has been issued to you.',
    'certificate'
  );
  return new;
end $$;

drop trigger if exists certificates_notify_issued on public.certificates;
create trigger certificates_notify_issued
  after insert on public.certificates
  for each row execute function public.notify_certificate_issued();

-- ── Verified hours (only verified records count) ───────────────────────────
create or replace function public.my_verified_hours()
returns numeric
language sql stable security definer
set search_path = public
as $$
  select coalesce(sum(hours), 0)
  from public.service_records
  where student_id = auth.uid()
    and verification_status = 'verified';
$$;

-- ============================================================================
-- Row Level Security
-- ============================================================================

alter table public.programs            enable row level security;
alter table public.program_participants enable row level security;
alter table public.service_records     enable row level security;
alter table public.notifications       enable row level security;
alter table public.certificates        enable row level security;

-- programs: published programs visible to members; drafts/cancelled admin-only.
drop policy if exists programs_select_published on public.programs;
create policy programs_select_published on public.programs
  for select using (
    status in ('upcoming', 'active', 'completed') or public.is_admin()
  );

drop policy if exists programs_admin_write on public.programs;
create policy programs_admin_write on public.programs
  for insert to authenticated with check (public.is_admin());

drop policy if exists programs_admin_update on public.programs;
create policy programs_admin_update on public.programs
  for update using (public.is_admin()) with check (public.is_admin());

-- program_participants: students manage their own enrollment only.
drop policy if exists participants_select_own on public.program_participants;
create policy participants_select_own on public.program_participants
  for select using (student_id = auth.uid() or public.is_admin());

drop policy if exists participants_insert_own on public.program_participants;
create policy participants_insert_own on public.program_participants
  for insert with check (student_id = auth.uid() and status = 'registered');

drop policy if exists participants_update_own_withdraw on public.program_participants;
create policy participants_update_own_withdraw on public.program_participants
  for update using (student_id = auth.uid())
  with check (student_id = auth.uid() and status = 'withdrawn');

drop policy if exists participants_update_admin on public.program_participants;
create policy participants_update_admin on public.program_participants
  for update using (public.is_admin()) with check (public.is_admin());

-- service_records: submit pending only; verification is admin-only.
drop policy if exists service_records_select_own on public.service_records;
create policy service_records_select_own on public.service_records
  for select using (student_id = auth.uid() or public.is_admin());

drop policy if exists service_records_insert_own on public.service_records;
create policy service_records_insert_own on public.service_records
  for insert with check (
    student_id = auth.uid()
    and verification_status = 'pending'
    and verified_by is null
  );

drop policy if exists service_records_update_admin on public.service_records;
create policy service_records_update_admin on public.service_records
  for update using (public.is_admin()) with check (public.is_admin());

-- notifications: private inbox; owner can only flip read.
drop policy if exists notifications_select_own on public.notifications;
create policy notifications_select_own on public.notifications
  for select using (user_id = auth.uid());

drop policy if exists notifications_update_own on public.notifications;
create policy notifications_update_own on public.notifications
  for update using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- certificates: owner + admins read; issued by admins/service role.
drop policy if exists certificates_select_own on public.certificates;
create policy certificates_select_own on public.certificates
  for select using (student_id = auth.uid() or public.is_admin());

-- ============================================================================
-- Grants
-- ============================================================================
grant select on public.programs to authenticated;
grant select, insert, update on public.program_participants to authenticated;
grant select, insert on public.service_records to authenticated;
grant select, update on public.notifications to authenticated;
grant select on public.certificates to authenticated;

-- ============ SEED DATA ============

-- ============================================================================
-- GBT seed data — demo programs for the student portal.
-- Run AFTER the migrations (as superuser / service role).
-- ============================================================================

insert into public.programs
  (title, slug, description, category, start_date, end_date, location,
   target_audience, objectives, requirements, status)
values
  (
    'Tuulaa Summer School 2026',
    'tuulaa-summer-school-2026',
    'Six weeks of free academic support in mathematics, science, and English for primary and secondary students around Tuulaa.',
    'Education',
    '2026-07-06', '2026-08-14', 'Tuulaa, Oromia',
    'Primary & secondary students',
    array['Prevent summer learning loss', 'Build study habits', 'Support exam preparation'],
    array['Attend the orientation day', 'Commit to at least 3 weeks', 'Follow the safeguarding guidelines'],
    'active'
  ),
  (
    'Bridge to University Mentorship',
    'bridge-to-university-2026',
    'One-on-one mentorship for grade 11–12 students on university preparation, careers, and study skills.',
    'Mentorship',
    '2026-08-01', '2026-12-20', 'Tuulaa & nearby towns',
    'Grade 11–12 students',
    array['Guide university and career decisions', 'Share study skills', 'Grow future volunteers'],
    array['Be a registered university student', 'Attend mentor training'],
    'active'
  ),
  (
    'Digital Horizons Literacy Lab',
    'digital-horizons-2026',
    'Hands-on computer and internet training for students and community members, including online safety.',
    'Digital Literacy',
    '2026-09-07', '2026-09-25', 'Tuulaa community hall',
    'Students & community members',
    array['Teach foundational computer skills', 'Introduce online learning', 'Promote internet safety'],
    array['Basic computer literacy helpful', 'Commit to the full lab schedule'],
    'upcoming'
  ),
  (
    'Green Roots Service Week',
    'green-roots-2026',
    'A community work week: cleanups, tree planting, and small development projects chosen with residents.',
    'Community Service',
    '2026-10-05', '2026-10-09', 'Tuulaa kebeles',
    'All volunteers',
    array['Deliver visible community projects', 'Model volunteering'],
    array['Physical readiness for outdoor work'],
    'upcoming'
  ),
  (
    'Bridges of Tolerance Dialogue Series',
    'bridges-of-tolerance-2026',
    'Facilitated youth dialogues and cultural evenings promoting respect and peaceful coexistence.',
    'Tolerance & Peace',
    '2026-08-17', '2026-08-21', 'Schools & community centers',
    'Youth (grade 9–12)',
    array['Promote dialogue and respect', 'Build friendships across communities'],
    array['Attend facilitator briefing'],
    'completed'
  )
on conflict (slug) do nothing;

-- ============================================================================
-- GBT Phase 5 — Performance Indexes
-- ============================================================================

-- profiles
create index if not exists idx_profiles_email on public.profiles (email);
create index if not exists idx_profiles_role on public.profiles (role);

-- student_profiles
create index if not exists idx_student_profiles_profile_id on public.student_profiles (profile_id);
create index if not exists idx_student_profiles_student_id on public.student_profiles (student_id);
create index if not exists idx_student_profiles_university on public.student_profiles (university);
create index if not exists idx_student_profiles_department on public.student_profiles (department);

-- applications
create index if not exists idx_applications_student_profile_id on public.applications (student_profile_id);
create index if not exists idx_applications_application_number on public.applications (application_number);
create index if not exists idx_applications_status on public.applications (status);

-- programs
create index if not exists idx_programs_status on public.programs (status);
create index if not exists idx_programs_category on public.programs (category);

-- program_participants
create index if not exists idx_program_participants_program_id on public.program_participants (program_id);
create index if not exists idx_program_participants_student_id on public.program_participants (student_id);
create index if not exists idx_program_participants_status on public.program_participants (status);

-- service_records
create index if not exists idx_service_records_student_id on public.service_records (student_id);
create index if not exists idx_service_records_program_id on public.service_records (program_id);
create index if not exists idx_service_records_verification_status on public.service_records (verification_status);

-- certificates
create index if not exists idx_certificates_student_id on public.certificates (student_id);
create index if not exists idx_certificates_certificate_number on public.certificates (certificate_number);

