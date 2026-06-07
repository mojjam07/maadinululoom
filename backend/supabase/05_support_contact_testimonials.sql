-- Support / Contact / Testimonials tables

-- Contact submissions from landing page
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  message text not null,
  created_at timestamptz not null default now(),

  -- quick categorization
  source text not null default 'landing'
);

create index if not exists contact_messages_created_at_idx on public.contact_messages(created_at desc);

-- Public testimonials submitted by students
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,

  stars numeric,
  text text not null,
  avatar text,
  name text,
  country text,
  role text,

  created_at timestamptz not null default now(),

  -- allow moderation later
  is_approved boolean not null default true
);

create index if not exists testimonials_created_at_idx on public.testimonials(created_at desc);

-- RLS
alter table public.contact_messages enable row level security;
alter table public.testimonials enable row level security;

-- Contact: students can not access; admin via service role only. Keep RLS locked down.
create policy "contact_messages_none" on public.contact_messages for select using (false);
create policy "contact_messages_none_insert" on public.contact_messages for insert with check (false);
create policy "contact_messages_none_update" on public.contact_messages for update using (false);
create policy "contact_messages_none_delete" on public.contact_messages for delete using (false);

-- Testimonials: public can read approved only. Auth users can insert their own (student dashboard).
create policy "testimonials_public_select_approved" on public.testimonials for select using (
  is_approved = true
);

create policy "testimonials_student_insert_own" on public.testimonials
for insert with check (auth.uid() = student_id);

create policy "testimonials_student_update_own" on public.testimonials
for update using (auth.uid() = student_id) with check (auth.uid() = student_id);


