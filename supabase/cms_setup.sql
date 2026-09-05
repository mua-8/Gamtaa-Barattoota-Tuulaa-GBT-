-- ============================================================================
-- GBT Phase 6 — Super Admin CMS
-- ============================================================================

-- ── 1. team_members ─────────────────────────────────────────────────────────
create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  role text not null,
  bio text,
  image_url text,
  social_links jsonb default '[]'::jsonb,
  display_order int default 0,
  is_published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger team_members_updated_at
  before update on public.team_members
  for each row execute function public.set_updated_at();

-- ── 2. gallery_items ────────────────────────────────────────────────────────
create table if not exists public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  title text,
  description text,
  image_url text not null,
  category text,
  display_order int default 0,
  is_published boolean default false,
  created_at timestamptz default now()
);

-- ── 3. impact_items ─────────────────────────────────────────────────────────
create table if not exists public.impact_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  value text not null,
  unit text,
  icon text,
  display_order int default 0,
  is_published boolean default false,
  created_at timestamptz default now()
);

-- ── 4. site_content ─────────────────────────────────────────────────────────
create table if not exists public.site_content (
  page_slug text primary key,
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

create trigger site_content_updated_at
  before update on public.site_content
  for each row execute function public.set_updated_at();

-- ── Helper function for Super Admin check ──────────────────────────────────
create or replace function public.is_super_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select coalesce((select role from public.profiles where id = auth.uid()) = 'super_admin', false);
$$;

-- ── RLS ─────────────────────────────────────────────────────────────────────
alter table public.team_members enable row level security;
alter table public.gallery_items enable row level security;
alter table public.impact_items enable row level security;
alter table public.site_content enable row level security;

-- Public Read Policies
create policy public_read_team on public.team_members for select using (is_published = true or public.is_super_admin());
create policy public_read_gallery on public.gallery_items for select using (is_published = true or public.is_super_admin());
create policy public_read_impact on public.impact_items for select using (is_published = true or public.is_super_admin());
create policy public_read_content on public.site_content for select using (true);

-- Super Admin Write Policies
create policy super_admin_team on public.team_members for all using (public.is_super_admin()) with check (public.is_super_admin());
create policy super_admin_gallery on public.gallery_items for all using (public.is_super_admin()) with check (public.is_super_admin());
create policy super_admin_impact on public.impact_items for all using (public.is_super_admin()) with check (public.is_super_admin());
create policy super_admin_content on public.site_content for all using (public.is_super_admin()) with check (public.is_super_admin());

-- ── Grants ──────────────────────────────────────────────────────────────────
grant select on public.team_members to anon, authenticated;
grant select on public.gallery_items to anon, authenticated;
grant select on public.impact_items to anon, authenticated;
grant select on public.site_content to anon, authenticated;

grant all on public.team_members to authenticated;
grant all on public.gallery_items to authenticated;
grant all on public.impact_items to authenticated;
grant all on public.site_content to authenticated;
