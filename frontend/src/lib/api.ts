import { supabase } from './supabaseClient'

// ========================
// API BASE CONFIG (FIXED)
// ========================

const rawBase = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? ''

// Normalize: remove trailing slashes + whitespace
const cleanedBase = rawBase.trim().replace(/\/+$/, '')

// Validate URL (important to prevent fetch errors)
export const API_BASE =
  cleanedBase.length > 0 ? cleanedBase : ''

if (API_BASE && !/^https?:\/\//.test(API_BASE)) {
  throw new Error(
    `Invalid VITE_API_BASE_URL: ${API_BASE}. Must start with http:// or https://`
  )
}

// ========================
// AUTH HELPERS
// ========================

export async function getAuthToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}

export async function getCurrentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession()
  return data.session?.user?.id ?? null
}

// ========================
// CORE FETCH WRAPPER
// ========================

export async function apiFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const token = await getAuthToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string> | undefined),
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const safePath = path.startsWith('/') ? path : `/${path}`

  // If API_BASE is empty, fallback to same-origin
  const url = API_BASE ? `${API_BASE}${safePath}` : safePath

  if (!url || url.includes('undefined')) {
    throw new Error(`Invalid API URL constructed: ${url}`)
  }

  const res = await fetch(url, {
    ...init,
    headers,
  })

  let parsed: unknown

  try {
    parsed = await res.json()
  } catch {
    parsed = {}
  }

  const body = parsed as Record<string, unknown>

  if (!res.ok) {
    const msg =
      (typeof body.error === 'string' && (body.error as string)) ||
      (typeof body.message === 'string' && (body.message as string)) ||
      'api_error'

    throw new Error(msg)
  }

  return parsed as T
}

// ========================
// API HELPERS
// ========================

export async function getMyAttendance(): Promise<{
  attendance: Array<{
    student_id: string
    class_id: string
    joined_at: string
    duration_mins: number | null
  }>
}> {
  const userId = await getCurrentUserId()
  if (!userId) throw new Error('missing_user')

  return apiFetch(`/api/attendance/${encodeURIComponent(userId)}`)
}

export async function getMyAssignments(): Promise<{
  assignments: Array<{
    id: string
    lesson_id: string
    title: string
    due_date: string | null
    instructions: string | null
  }>
}> {
  const userId = await getCurrentUserId()
  if (!userId) throw new Error('missing_user')

  return apiFetch(`/api/assignments/${encodeURIComponent(userId)}`)
}

export async function getSubjects(): Promise<{
  subjects: Array<{
    id: string
    name_ar: string
    name_en: string
    description?: string | null
    icon?: string | null
  }>
}> {
  return apiFetch('/api/subjects')
}

export async function getLessonsBySubject(subjectId: string): Promise<{
  lessons: Array<{
    id: string
    subject_id: string
    title: string
    video_url: string | null
    notes_url: string | null
    duration: number | null
  }>
}> {
  return apiFetch(`/api/lessons/${encodeURIComponent(subjectId)}`)
}

// ========================
// CERTIFICATES
// ========================

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
  subject_name?:
    | string
    | { name_ar: string; name_en: string }
    | null
  exam_score_raw?: unknown
}

export async function getMyCertificates(): Promise<{
  certificates: CertificateItem[]
}> {
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
  return apiFetch(
    `/api/certificates/verify/${encodeURIComponent(certId)}`
  )
}

// ========================
// PROGRESS
// ========================

export async function patchLessonProgress(
  lessonId: string,
  completed: boolean
): Promise<{
  progress: {
    student_id: string
    lesson_id: string
    completed: boolean
    watched_at: string | null
  }
}> {
  return apiFetch(`/api/progress/${encodeURIComponent(lessonId)}`, {
    method: 'PATCH',
    body: JSON.stringify({ completed }),
  })
}