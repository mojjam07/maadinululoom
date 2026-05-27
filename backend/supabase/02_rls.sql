-- Enable RLS
alter table public.profiles enable row level security;
alter table public.subjects enable row level security;
alter table public.teachers enable row level security;
alter table public.teacher_subjects enable row level security;
alter table public.enrollments enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.assignments enable row level security;
alter table public.submissions enable row level security;
alter table public.attendance enable row level security;


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

-- Lessons: public read (for simplicity)
create policy "lessons_public_select" on public.lessons for select using (true);

-- Lesson progress: student can select/insert/update own
create policy "lesson_progress_student_select_own" on public.lesson_progress for select using (auth.uid() = student_id);
create policy "lesson_progress_student_upsert_own" on public.lesson_progress for all using (auth.uid() = student_id) with check (auth.uid() = student_id);

-- Assignments: public read (so students can see)
create policy "assignments_public_select" on public.assignments for select using (true);

-- Submissions: student can select/insert/update own
create policy "submissions_student_select_own" on public.submissions for select using (auth.uid() = student_id);
create policy "submissions_student_insert_own" on public.submissions for insert with check (auth.uid() = student_id);
create policy "submissions_student_update_own" on public.submissions for update using (auth.uid() = student_id) with check (auth.uid() = student_id);

-- Attendance: student can select own
create policy "attendance_student_select_own" on public.attendance for select using (auth.uid() = student_id);

-- Admin can bypass via separate policies - left for later refinement

