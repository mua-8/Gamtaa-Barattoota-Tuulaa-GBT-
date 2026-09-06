-- Migration: 0007_team_founder.sql
-- Add founder categorization and narrative fields to team_members

alter table public.team_members
  add column if not exists member_type text not null default 'program_team',
  add column if not exists intro text,
  add column if not exists bio text;
