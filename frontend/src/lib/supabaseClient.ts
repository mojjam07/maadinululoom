import { createClient } from '@supabase/supabase-js'

// NOTE:
// This app uses the Supabase **anon key** for client-side session.
// User signs in using Supabase-js and the session token is sent to backend
// via Authorization header.

const rawUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const rawAnon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

function sanitizeEnvValue(v?: string) {
  if (!v) return undefined
  const t = v.trim()
  // strip surrounding single/double quotes if present
  return t.replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1')
}

const SUPABASE_URL = sanitizeEnvValue(rawUrl)
const SUPABASE_ANON_KEY = sanitizeEnvValue(rawAnon)

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Frontend auth may not work.', {
    VITE_SUPABASE_URL: SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: SUPABASE_ANON_KEY ? '***REDACTED***' : undefined,
  })
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Add them to frontend/.env.local and restart the dev server.'
  )
}

// Validate SUPABASE_URL is a proper URL to avoid passing invalid input to fetch
new URL(SUPABASE_URL)

let _supabase
try {
  _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
} catch (err) {
  console.error('Failed to create Supabase client', {
    VITE_SUPABASE_URL: SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: SUPABASE_ANON_KEY ? '***REDACTED***' : undefined,
    error: err,
  })
  throw err
}

export const supabase = _supabase


