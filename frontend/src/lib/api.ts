import { supabase } from './supabaseClient'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

// In production we expect to load the API from the same origin (no base URL).
// In development, set VITE_API_BASE_URL=http://localhost:3000 (or your dev API URL).

export async function getAuthToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}

export async function getCurrentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession()
  return data.session?.user?.id ?? null
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getAuthToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string> | undefined),
  }

  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  })

  const json = (await res.json().catch(() => ({} as Record<string, unknown>))) as Record<string, unknown>

  if (!res.ok) {
    const msg =
      (typeof json.error === 'string' && json.error) ||
      (typeof json.message === 'string' && json.message) ||
      'api_error'
    throw new Error(msg)
  }
  return json as T
}

export async function getMyAttendance(): Promise<{
  attendance: Array<{ student_id: string; class_id: string; joined_at: string; duration_mins: number | null }>
}> {
  const userId = await getCurrentUserId()
  if (!userId) throw new Error('missing_user')
  return apiFetch(`/api/attendance/${encodeURIComponent(userId)}`)
}

export async function getMyAssignments(): Promise<{
  assignments: Array<{ id: string; lesson_id: string; title: string; due_date: string | null; instructions: string | null }>
}> {
  const userId = await getCurrentUserId()
  if (!userId) throw new Error('missing_user')
  return apiFetch(`/api/assignments/${encodeURIComponent(userId)}`)
}

export async function getSubjects(): Promise<{
  subjects: Array<{ id: string; name_ar: string; name_en: string; description?: string | null; icon?: string | null }>
}> {
  return apiFetch('/api/subjects')
}

export async function getLessonsBySubject(subjectId: string): Promise<{
  lessons: Array<{ id: string; subject_id: string; title: string; video_url: string | null; notes_url: string | null; duration: number | null }>
}> {
  return apiFetch(`/api/lessons/${encodeURIComponent(subjectId)}`)
}

export type CertificateItem = {
  id?: string
  cert_id: string
  issued_at: string
  status: string
  snapshot?: Record<string, unknown> | null
  exam_score?: Record<string, unknown> | null
  pdf_storage_path?: string | null
  pdf_url?: string | null
  student_name?: string | null
  subject_id?: string | null
  subject_name?: string | { name_ar: string; name_en: string } | null
  exam_score_raw?: unknown
}

export async function getMyCertificates(): Promise<{ certificates: CertificateItem[] }> {
  return apiFetch('/api/certificates/me')
}

export async function verifyCertificate(certId: string): Promise<{
  valid: boolean
  cert_id: string
  issued_at: string
  status: string
  student_name: string | null
  subject_name: { name_ar: string; name_en: string } | null
  exam_score: unknown
  pdf_url: string | null
}> {
  return apiFetch(`/api/certificates/verify/${encodeURIComponent(certId)}`)
}

export async function patchLessonProgress(lessonId: string, completed: boolean): Promise<{ 

  progress: { student_id: string; lesson_id: string; completed: boolean; watched_at: string | null }
}> {
  return apiFetch(`/api/progress/${encodeURIComponent(lessonId)}`, {
    method: 'PATCH',
    body: JSON.stringify({ completed }),
  })
}





