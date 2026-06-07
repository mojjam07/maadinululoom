import { Router } from 'express'
import { supabaseAdmin } from '../supabaseAdmin'

export const authRouter = Router()

// Email/password sign-up
authRouter.post('/register', async (req, res) => {
  const { email, password, role, name } = req.body as {
    email?: string
    password?: string
    role?: 'student' | 'teacher' | 'admin'
    name?: string
  }

  if (!email || !password) return res.status(400).json({ error: 'missing_email_or_password' })

  const signUpRole = role || 'student'
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: signUpRole, name: name || null },
  })

  if (error) return res.status(400).json({ error: 'register_failed', details: error.message })

  // Create profile row
  const userId = data.user.id
  const { error: upErr } = await supabaseAdmin.from('profiles').insert({
    id: userId,
    name: name || null,
    role: signUpRole,
    country: null,
    phone: null,
    avatar: null,
  })

  if (upErr) return res.status(400).json({ error: 'profile_create_failed', details: upErr.message })

  // For refresh-token handling in frontend, we will require explicit login to get session.
  return res.json({ ok: true, userId })
})

authRouter.post('/login', async (req, res) => {
  // Client-side auth uses Supabase-js (anon key) to create a session.
  // This endpoint exists only for backward compatibility and will no longer 501.
  // Frontend should sign in directly with supabase.auth.signInWithPassword.
  return res.json({ ok: true, note: 'use_supabase_client_login' })
})

