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
alter table public.classes enable row level security;
alter table public.class_enrollments enable row level security;
alter table public.notifications enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;


-- Subjects are public read


drop policy if exists "subjects_select_all" on public.subjects;
create policy "subjects_select_all" on public.subjects for select using (true);

-- Profiles: user can read/update own row
drop policy if exists "profiles_self_select" on public.profiles;
drop policy if exists "profiles_self_select" on public.profiles;
create policy "profiles_self_select" on public.profiles for select using (auth.uid() = id);

drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update" on public.profiles for update using (auth.uid() = id);

-- Enrollments: student can insert for self and select own
drop policy if exists "enrollments_student_select_own" on public.enrollments;
create policy "enrollments_student_select_own" on public.enrollments for select using (auth.uid() = student_id);

drop policy if exists "enrollments_student_insert_own" on public.enrollments;
create policy "enrollments_student_insert_own" on public.enrollments for insert with check (auth.uid() = student_id);

-- Teachers: teacher can read own teacher row
drop policy if exists "teachers_self_select" on public.teachers;
create policy "teachers_self_select" on public.teachers for select using (exists (
  select 1 from public.profiles p where p.id = teachers.profile_id and p.id = auth.uid()
));

-- Teacher subjects: teacher can read own assignments
drop policy if exists "teacher_subjects_select_own" on public.teacher_subjects;
create policy "teacher_subjects_select_own" on public.teacher_subjects for select using (exists (
  select 1 from public.teachers t where t.id = teacher_subjects.teacher_id and t.profile_id = auth.uid()
));


-- Lessons: public read (for simplicity)
create policy "lessons_public_select" on public.lessons for select using (true);

-- Attendance: student can select own (defined above originally)


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

-- Live classes
-- Student can read classes they are enrolled in
create policy "classes_student_select_enrolled" on public.classes
for select using (
  exists (
    select 1 from public.class_enrollments ce
    where ce.class_id = classes.id and ce.student_id = auth.uid()
  )
);

-- Teacher can read their own classes
create policy "classes_teacher_select_own" on public.classes
for select using (
  exists (
    select 1 from public.teachers t
    where t.id = classes.teacher_id and t.profile_id = auth.uid()
  )
);

-- Student can enroll/select own class_enrollments
create policy "class_enrollments_student_select_own" on public.class_enrollments
for select using (auth.uid() = student_id);

create policy "class_enrollments_student_insert_own" on public.class_enrollments
for insert with check (auth.uid() = student_id);

-- Notifications: user can manage own notifications
create policy "notifications_user_select_own" on public.notifications
for select using (auth.uid() = user_id);

create policy "notifications_user_insert_own" on public.notifications
for insert with check (auth.uid() = user_id);

create policy "notifications_user_update_own" on public.notifications
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Subscriptions: student can read own subscriptions
create policy "subscriptions_student_select_own" on public.subscriptions
for select using (auth.uid() = student_id);

-- Payments: student can read own payment history
create policy "payments_student_select_own" on public.payments
for select using (auth.uid() = student_id);

-- Admin/Backend access is handled via service role; RLS blocks normal client writes.
-- Admin grant/revoke and webhook updates will use supabase service role.

-- Admin can bypass via separate policies - left for later refinement




