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
