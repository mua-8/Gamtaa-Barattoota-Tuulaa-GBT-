-- Add missing CMS fields to existing programs table
ALTER TABLE public.programs
ADD COLUMN IF NOT EXISTS short_description text,
ADD COLUMN IF NOT EXISTS display_order int default 0,
ADD COLUMN IF NOT EXISTS content jsonb;
