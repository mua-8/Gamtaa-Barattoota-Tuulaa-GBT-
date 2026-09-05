-- Add additional educational fields to team members
alter table public.team_members 
add column if not exists university text,
add column if not exists department text,
add column if not exists education_level text default 'undergraduate';
