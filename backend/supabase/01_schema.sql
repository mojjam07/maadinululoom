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

-- Lessons
create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  title text not null,
  video_url text,
  notes_url text,
  duration int
);

create index if not exists lessons_subject_id_idx on public.lessons(subject_id);

-- Lesson progress
create table if not exists public.lesson_progress (
  student_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed boolean not null default false,
  watched_at timestamptz,
  primary key (student_id, lesson_id)
);

create index if not exists lesson_progress_student_id_idx on public.lesson_progress(student_id);
create index if not exists lesson_progress_lesson_id_idx on public.lesson_progress(lesson_id);

-- Assignments
create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  title text not null,
  due_date timestamptz,
  instructions text
);

create index if not exists assignments_lesson_id_idx on public.assignments(lesson_id);
create index if not exists assignments_due_date_idx on public.assignments(due_date);

-- Submissions
create table if not exists public.submissions (
  student_id uuid not null references public.profiles(id) on delete cascade,
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  file_url text,
  grade numeric,
  feedback text,
  primary key (student_id, assignment_id)
);

create index if not exists submissions_assignment_id_idx on public.submissions(assignment_id);
create index if not exists submissions_student_id_idx on public.submissions(student_id);

-- Attendance
create table if not exists public.attendance (
  student_id uuid not null references public.profiles(id) on delete cascade,
  class_id uuid not null,
  joined_at timestamptz not null default now(),
  duration_mins int not null default 0,
  primary key (student_id, class_id, joined_at)
);

create index if not exists attendance_student_id_idx on public.attendance(student_id);
create index if not exists attendance_class_id_idx on public.attendance(class_id);

-- Live classes
create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  zoom_link text,
  scheduled_at timestamptz not null,
  recording_url text
);

create index if not exists classes_scheduled_at_idx on public.classes(scheduled_at);
create index if not exists classes_teacher_id_idx on public.classes(teacher_id);
create index if not exists classes_subject_id_idx on public.classes(subject_id);

-- Student enrollment to classes
create table if not exists public.class_enrollments (
  class_id uuid not null references public.classes(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  primary key (class_id, student_id)
);

create index if not exists class_enrollments_class_id_idx on public.class_enrollments(class_id);
create index if not exists class_enrollments_student_id_idx on public.class_enrollments(student_id);

-- Notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,

  -- In-app / UI fields
  title text not null default '',
  body text not null default '',

  -- Backed by reminderDispatch (class reminders)
  read boolean not null default false,
  read_at timestamptz,

  -- Extra data (optional)
  metadata jsonb,

  created_at timestamptz not null default now()
);

create index if not exists notifications_user_created_at_idx on public.notifications(user_id, created_at desc);

-- Subscriptions
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,

  -- NG vs Intl plan identifiers
  plan text not null,
  status text not null check (status in ('active','past_due','canceled')),

  expires_at timestamptz,
  payment_ref text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_student_id_idx on public.subscriptions(student_id);
create index if not exists subscriptions_status_expires_idx on public.subscriptions(status, expires_at desc);

-- Payments
create table if not exists public.payments (
  id uuid primary key,
  student_id uuid not null references public.profiles(id) on delete cascade,

  amount numeric not null,
  currency text not null,

  provider text not null check (provider in ('paystack','stripe')),
  status text not null check (status in ('succeeded','failed')),

  paid_at timestamptz,

  payment_ref text not null,
  metadata jsonb,

  created_at timestamptz not null default now()
);

create unique index if not exists payments_provider_payment_ref_uidx on public.payments(provider, payment_ref);
create index if not exists payments_student_id_paid_at_idx on public.payments(student_id, paid_at desc);








