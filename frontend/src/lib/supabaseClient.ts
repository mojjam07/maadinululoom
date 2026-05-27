import { createClient } from '@supabase/supabase-js'

// NOTE:
// This app uses the Supabase **anon key** for client-side session.
// User signs in using Supabase-js and the session token is sent to backend
// via Authorization header.

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Frontend auth may not work.'
  )
}

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Add them to frontend/.env.local and restart the dev server.'
  )
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)


