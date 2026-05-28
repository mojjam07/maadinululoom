-- Phase 6: Certificates + Quizzes/Exams (minimal schema scaffold)

-- ============ Certificates ============

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  cert_id text not null unique,

  student_id uuid not null references public.profiles(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,

  -- issued when student completes course + passes any exam requirements
  issued_at timestamptz not null default now(),

  -- snapshot fields (kept flexible)
  status text not null default 'active' check (status in ('active','revoked','pending')),
  snapshot jsonb not null default '{}'::jsonb,

  -- score summary for UI
  exam_score jsonb not null default '{}'::jsonb,

  -- where the PDF lives in storage
  pdf_storage_path text not null,

  created_at timestamptz not null default now()
);

create index if not exists certificates_student_id_idx on public.certificates(student_id);
create index if not exists certificates_subject_id_idx on public.certificates(subject_id);
create index if not exists certificates_issued_at_idx on public.certificates(issued_at desc);

-- Events/audit trail (optional but useful)
create table if not exists public.certificate_events (
  id uuid primary key default gen_random_uuid(),
  certificate_id uuid not null references public.certificates(id) on delete cascade,
  event_type text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists certificate_events_certificate_id_idx on public.certificate_events(certificate_id);

-- ============ Quizzes/Exams ============

-- Quiz set belongs to a lesson or subject. For now we link to lesson.
create table if not exists public.quiz_sets (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  title text not null,
  description text,

  mode text not null default 'quiz' check (mode in ('quiz','exam')),
  timed boolean not null default false,
  duration_secs int,

  passing_score numeric,

  created_by_profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists quiz_sets_lesson_id_idx on public.quiz_sets(lesson_id);

create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_set_id uuid not null references public.quiz_sets(id) on delete cascade,
  position int not null default 0,

  prompt_ar text not null default '',
  prompt_en text not null default '',
  prompt_fr text,

  question_type text not null check (question_type in ('mcq','short')),

  -- MCQ payload
  mcq_options jsonb not null default '[]'::jsonb, -- array of {value, label_ar, label_en}
  mcq_correct_value text,

  -- short answer expected answer/rubric (manual grading)
  short_expected text,
  short_rubric jsonb not null default '{}'::jsonb,

  points numeric not null default 1
);

create index if not exists quiz_questions_quiz_set_id_idx on public.quiz_questions(quiz_set_id);
create index if not exists quiz_questions_position_idx on public.quiz_questions(quiz_set_id, position);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_set_id uuid not null references public.quiz_sets(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,

  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null default 'in_progress' check (status in ('in_progress','submitted','graded')),

  duration_secs int,

  total_score numeric,
  auto_scored boolean not null default false,

  unique (quiz_set_id, student_id, started_at)
);

create index if not exists quiz_attempts_quiz_set_id_idx on public.quiz_attempts(quiz_set_id);
create index if not exists quiz_attempts_student_id_idx on public.quiz_attempts(student_id);

create table if not exists public.mcq_responses (
  attempt_id uuid not null references public.quiz_attempts(id) on delete cascade,
  question_id uuid not null references public.quiz_questions(id) on delete cascade,
  selected_value text,

  is_correct boolean,
  score numeric,

  primary key (attempt_id, question_id)
);

create index if not exists mcq_responses_attempt_id_idx on public.mcq_responses(attempt_id);

create table if not exists public.short_responses (
  attempt_id uuid not null references public.quiz_attempts(id) on delete cascade,
  question_id uuid not null references public.quiz_questions(id) on delete cascade,

  answer_text text,

  -- manual grade
  grade numeric,
  feedback text,
  graded_by_profile_id uuid references public.profiles(id) on delete set null,
  graded_at timestamptz,

  primary key (attempt_id, question_id)
);

create index if not exists short_responses_attempt_id_idx on public.short_responses(attempt_id);

-- ============ Basic RLS placeholders for Phase 6 tables ============
-- NOTE: Fine-grained policies should be refined once we wire backend endpoints.

alter table public.certificates enable row level security;
alter table public.certificate_events enable row level security;

alter table public.quiz_sets enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.mcq_responses enable row level security;
alter table public.short_responses enable row level security;

-- Certificates
create policy "certificates_student_select_own" on public.certificates for select
  using (auth.uid() = student_id);

create policy "certificates_student_insert_own" on public.certificates for insert
  with check (auth.uid() = student_id);

-- Admin/server will issue via service role (bypasses RLS)

-- Quiz sets/questions: teacher/admin create, student select attempts
-- Start simple: public read for lesson content (will adjust later)
create policy "quiz_sets_public_select" on public.quiz_sets for select using (true);
create policy "quiz_questions_public_select" on public.quiz_questions for select using (true);

-- Attempts: student reads/writes their own
create policy "quiz_attempts_student_select_own" on public.quiz_attempts for select using (auth.uid() = student_id);
create policy "quiz_attempts_student_insert_own" on public.quiz_attempts for insert with check (auth.uid() = student_id);

-- Responses: student reads/writes their own (by attempt->student)
create policy "mcq_responses_student_select_own" on public.mcq_responses for select using (
  exists (select 1 from public.quiz_attempts a where a.id = mcq_responses.attempt_id and a.student_id = auth.uid())
);

create policy "mcq_responses_student_upsert_own" on public.mcq_responses for all using (
  exists (select 1 from public.quiz_attempts a where a.id = mcq_responses.attempt_id and a.student_id = auth.uid())
) with check (
  exists (select 1 from public.quiz_attempts a where a.id = mcq_responses.attempt_id and a.student_id = auth.uid())
);

create policy "short_responses_student_select_own" on public.short_responses for select using (
  exists (select 1 from public.quiz_attempts a where a.id = short_responses.attempt_id and a.student_id = auth.uid())
);

create policy "short_responses_student_upsert_own" on public.short_responses for all using (
  exists (select 1 from public.quiz_attempts a where a.id = short_responses.attempt_id and a.student_id = auth.uid())
) with check (
  exists (select 1 from public.quiz_attempts a where a.id = short_responses.attempt_id and a.student_id = auth.uid())
);

