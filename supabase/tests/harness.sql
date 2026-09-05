-- ============================================================================
-- Local verification harness.
-- Recreates the minimal Supabase environment (auth schema + auth.uid(),
-- storage schema, API roles) on a vanilla Postgres cluster so the real
-- migration (0001_initial_schema.sql) can be executed and RLS policies
-- tested without a hosted Supabase project.
-- ============================================================================

-- API roles
do $$ begin create role anon nologin; exception when duplicate_object then null; end $$;
do $$ begin create role authenticated nologin; exception when duplicate_object then null; end $$;
do $$ begin create role service_role nologin bypassrls; exception when duplicate_object then null; end $$;

-- auth schema stub
create schema if not exists auth;
create table if not exists auth.users (
  id uuid primary key,
  email text unique,
  raw_user_meta_data jsonb,
  created_at timestamptz not null default now()
);

create or replace function auth.uid() returns uuid
language sql stable
as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;

-- storage schema stub
create schema if not exists storage;
create table if not exists storage.buckets (
  id text primary key,
  name text not null,
  public boolean not null default false
);
create table if not exists storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text references storage.buckets (id),
  name text not null,
  owner uuid,
  created_at timestamptz not null default now()
);

create or replace function storage.foldername(path text) returns text[]
language sql immutable
as $$ select string_to_array(path, '/') $$;

alter table storage.objects enable row level security;

grant usage on schema auth to anon, authenticated, service_role;
grant usage on schema storage to anon, authenticated, service_role;
grant select on storage.objects to anon, authenticated, service_role;
grant insert, update, delete on storage.objects to authenticated, service_role;
grant select on storage.buckets to anon, authenticated, service_role;

-- Public read access at the GRANT level mirrors Supabase defaults; the
-- storage policies then do the fine-grained work.
grant select on all tables in schema public to anon;
