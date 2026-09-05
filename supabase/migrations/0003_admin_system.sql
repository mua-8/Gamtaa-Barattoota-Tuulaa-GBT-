-- ============================================================================
-- GBT Phase 4 — Admin Dashboard & Organization Management
-- ============================================================================

-- ── 1. Audit Logs ────────────────────────────────────────────────────────
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles(id) on delete cascade,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- RLS: super_admin can read all. admins can read all. nobody can update/delete. 
-- service_role or authenticated admins can insert.
alter table public.audit_logs enable row level security;
create policy "Admins can view audit logs" 
  on public.audit_logs for select 
  using (public.my_role() in ('admin', 'super_admin'));
create policy "Admins can insert audit logs" 
  on public.audit_logs for insert 
  with check (public.my_role() in ('admin', 'super_admin'));

-- ── 2. Team Members ──────────────────────────────────────────────────────
create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  position text not null,
  photo_url text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.team_members enable row level security;
create policy "Anyone can view active team members" 
  on public.team_members for select 
  using (is_active = true or public.my_role() in ('admin', 'super_admin'));
create policy "Admins can manage team members" 
  on public.team_members for all 
  using (public.my_role() in ('admin', 'super_admin'));

create trigger team_members_updated_at
  before update on public.team_members
  for each row execute function public.set_updated_at();

-- ── 3. Testimonials ──────────────────────────────────────────────────────
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  organization text,
  photo_url text,
  quote text not null,
  program_id uuid references public.programs(id) on delete set null,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.testimonials enable row level security;
create policy "Anyone can view published testimonials" 
  on public.testimonials for select 
  using (is_published = true or public.my_role() in ('admin', 'super_admin'));
create policy "Admins can manage testimonials" 
  on public.testimonials for all 
  using (public.my_role() in ('admin', 'super_admin'));

create trigger testimonials_updated_at
  before update on public.testimonials
  for each row execute function public.set_updated_at();

-- ── 4. Announcements ─────────────────────────────────────────────────────
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.announcements enable row level security;
create policy "Anyone can view published announcements" 
  on public.announcements for select 
  using (is_published = true or public.my_role() in ('admin', 'super_admin'));
create policy "Admins can manage announcements" 
  on public.announcements for all 
  using (public.my_role() in ('admin', 'super_admin'));

create trigger announcements_updated_at
  before update on public.announcements
  for each row execute function public.set_updated_at();

-- ── 5. Impact Metrics ────────────────────────────────────────────────────
-- A simple key-value or structured table for organization-wide impact stats
create table if not exists public.impact_metrics (
  id uuid primary key default gen_random_uuid(),
  metric_key text not null unique,
  metric_value integer not null default 0,
  metric_label text not null,
  updated_at timestamptz not null default now()
);

alter table public.impact_metrics enable row level security;
create policy "Anyone can view impact metrics" 
  on public.impact_metrics for select 
  using (true);
create policy "Admins can manage impact metrics" 
  on public.impact_metrics for all 
  using (public.my_role() in ('admin', 'super_admin'));

create trigger impact_metrics_updated_at
  before update on public.impact_metrics
  for each row execute function public.set_updated_at();

-- Default initial impact metrics
insert into public.impact_metrics (metric_key, metric_value, metric_label) values
  ('total_volunteers', 0, 'Student Volunteers'),
  ('communities_served', 0, 'Communities Served'),
  ('schools_reached', 0, 'Schools Reached'),
  ('students_reached', 0, 'Students Reached'),
  ('total_hours', 0, 'Volunteer Hours')
on conflict (metric_key) do nothing;
