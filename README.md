# معدن (Maadin)

A learning platform that connects students with teachers through subjects, lessons, assignments, progress tracking, attendance, and notifications.

## Tech stack

- **Frontend:** React + TypeScript + Vite
- **Backend:** Express + TypeScript
- **Database/Auth:** Supabase (Auth, RLS policies, storage)

## Key features

### Authentication & Profile
- Student/teacher/admin roles stored in **`public.profiles.role`**
- Profile APIs to fetch/update the authenticated user

### Subjects, Enrollment, Lessons
- Public subject listing
- Student enrollment into subjects
- Lessons list by subject
- Lesson progress stored per student/lesson (with an API endpoint that upserts progress)

### Assignments, Submissions, Teacher Grading
- Assignments derived for a student via enrolled subjects → lessons → assignments
- Student submissions upserted per student/assignment
- Teacher portal APIs to upload lessons, create assignments, and grade submissions

### Attendance (Student)
- Student attendance history per user
- UI computes attendance stats for the recent period

### Notifications
- Frontend listens to notifications via Supabase realtime and marks them read
- Backend routes exist for notification management/read state

### Additional modules (present in backend)
- Admin portal routes
- Web + payment provider integration services (Stripe/Paystack)
- Reminder delivery (email/webpush/whatsapp/zoom)
- Certificates + quiz-related routes exist in the backend

## Repository structure

- `backend/`
  - Express API server
  - Supabase schema + RLS SQL files under `backend/supabase/`
  - Payment/realtime/admin/notifications/reminders/certificates modules

- `frontend/`
  - React application
  - Dashboard and role-based UI

## Local development (high level)

1. **Configure environment variables** for Supabase connectivity and any provider integrations (admin/service-role keys, webhook secrets, etc.).
2. Run the **backend** and **frontend** dev servers (see `backend/package.json` and `frontend/package.json` scripts).

> Note: This repository includes many backend modules, but some UI areas may currently be placeholders depending on phase/feature completion.

## API overview (grouped)

- **Auth / Profile**
  - `/api/auth/*`
  - `/api/profile/:id`
- **Subjects / Enrollments**
  - `/api/subjects`
  - `/api/enrollments`
- **Lessons / Progress**
  - `/api/lessons/:subjectId`
  - `/api/progress/:lessonId`
- **Assignments / Submissions**
  - `/api/assignments/:studentId`
  - `/api/submissions`
- **Teacher portal**
  - `/api/teacher/lessons`
  - `/api/teacher/assignments`
  - `/api/teacher/submissions/:studentId/:assignmentId`
- **Attendance**
  - `/api/attendance/:studentId`
- **Notifications**
  - notification routes used by the notification UI

## Documentation

- `PROJECT_FUNCTIONALITIES_REPORT.txt` contains the current end-to-end functional coverage and implementation notes.
- `TODO.md` tracks remaining implementation phases.

### Local Postgres + Migrations

You can use Docker Compose to run a local Postgres and the backend service:

```bash
docker compose up -d
cd backend
# Wait for Postgres, then run migrations
npm install
npm run migrate
npm run dev
```

The migrations are in `backend/supabase/*.sql`. The migration runner records applied files in `public.schema_migrations`.

