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

alter table public.gallery_items enable row level security;
create policy "Anyone can view published gallery items" on public.gallery_items for select using (is_published = true or public.my_role() in ('admin', 'super_admin'));
create policy "Admins can manage gallery items" on public.gallery_items for all using (public.my_role() in ('admin', 'super_admin'));
