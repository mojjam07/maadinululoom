-- Enable RLS
alter table public.profiles enable row level security;
alter table public.subjects enable row level security;
alter table public.teachers enable row level security;
alter table public.teacher_subjects enable row level security;
alter table public.enrollments enable row level security;

-- Subjects are public read
create policy "subjects_select_all" on public.subjects for select using (true);

-- Profiles: user can read/update own row
create policy "profiles_self_select" on public.profiles for select using (auth.uid() = id);
create policy "profiles_self_update" on public.profiles for update using (auth.uid() = id);

-- Enrollments: student can insert for self and select own
create policy "enrollments_student_select_own" on public.enrollments for select using (auth.uid() = student_id);
create policy "enrollments_student_insert_own" on public.enrollments for insert with check (auth.uid() = student_id);

-- Teachers: teacher can read own teacher row
create policy "teachers_self_select" on public.teachers for select using (exists (
  select 1 from public.profiles p where p.id = teachers.profile_id and p.id = auth.uid()
));

-- Teacher subjects: teacher can read own assignments
create policy "teacher_subjects_select_own" on public.teacher_subjects for select using (exists (
  select 1 from public.teachers t where t.id = teacher_subjects.teacher_id and t.profile_id = auth.uid()
));

-- Admin can bypass via separate policies - left for later refinement
