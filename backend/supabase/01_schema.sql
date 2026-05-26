-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  role text not null check (role in ('student','teacher','admin')),
  country text,
  phone text,
  avatar text
);

-- Subjects
create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  name_ar text not null,
  name_en text not null,
  description text,
  icon text
);

-- Teachers (1 teacher row per profile)
create table if not exists public.teachers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique not null references public.profiles(id) on delete cascade,
  qualification text
);

-- Teacher subjects assignment
create table if not exists public.teacher_subjects (
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  primary key (teacher_id, subject_id)
);

-- Enrollments
create table if not exists public.enrollments (
  student_id uuid not null references public.profiles(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  status text not null default 'active',
  enrolled_at timestamptz not null default now(),
  primary key (student_id, subject_id)
);

create index if not exists enrollments_student_id_idx on public.enrollments(student_id);
create index if not exists enrollments_subject_id_idx on public.enrollments(subject_id);
