import { Router } from 'express'
import { supabaseAdmin } from '../supabaseAdmin'
import { requireAuth } from '../middleware/requireAuth'
import crypto from 'crypto'
import { authenticator } from 'otplib'
import { upsertTwoFactorSecret, getTwoFactorSecret } from '../services/twoFactor'
import { z } from 'zod'
import { validateBody } from '../middleware/validate'

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

// Replace previous simplistic register with validated body handling
const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['student', 'teacher', 'admin']).optional(),
  name: z.string().max(200).optional().nullable(),
})

authRouter.post('/register', validateBody(RegisterSchema), async (req, res) => {
  const { email, password, role, name } = req.body as z.infer<typeof RegisterSchema>

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

  return res.json({ ok: true, userId })
})

authRouter.post('/login', async (req, res) => {
  // Client-side auth uses Supabase-js (anon key) to create a session.
  // This endpoint exists only for backward compatibility and will no longer 501.
  // Frontend should sign in directly with supabase.auth.signInWithPassword.
  return res.json({ ok: true, note: 'use_supabase_client_login' })
})

// Send password reset email (uses Supabase client where available)
authRouter.post('/send-reset', async (req, res) => {
  const { email } = req.body as { email?: string }
  if (!email) return res.status(400).json({ error: 'missing_email' })

  // Prefer client-side flow, but try admin endpoint if available
  try {
    // Some versions expose a direct helper; check dynamically
    // @ts-ignore
    if (typeof supabaseAdmin.auth.resetPasswordForEmail === 'function') {
      // @ts-ignore
      const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email)
      if (error) return res.status(500).json({ error: 'reset_failed', details: error.message })
      return res.json({ ok: true })
    }
  } catch (e) {
    console.warn('resetPasswordForEmail not available on admin client', e)
  }

  // Fallback: instruct client to use Supabase client to send reset
  return res.status(501).json({ error: 'not_supported', message: 'Please use Supabase client-side password reset flow' })
})

// Enable TOTP 2FA: generates secret and stores encrypted secret in user_metadata via admin API
authRouter.post('/enable-2fa', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).auth.userId as string
    if (!userId) return res.status(401).json({ error: 'missing_user' })

    const secret = authenticator.generateSecret()
    const otpauth = authenticator.keyuri(req.body?.label || userId, 'maadin', secret)

    // Encrypt secret before storing using simple AES-256-GCM with server key
    const key = crypto.createHash('sha256').update(process.env.JWT_SECRET || 'dev-key').digest()
    const iv = crypto.randomBytes(12)
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
    const encrypted = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()])
    const tag = cipher.getAuthTag()

    const stored = Buffer.concat([iv, tag, encrypted]).toString('base64')

    // Store encrypted secret in server-managed table
    try {
      await upsertTwoFactorSecret(userId, stored)
    } catch (e) {
      return res.status(500).json({ error: 'store_failed', details: (e as Error).message })
    }

    return res.json({ ok: true, otpauth })
  } catch (e) {
    return res.status(500).json({ error: 'enable_2fa_failed', details: (e as Error).message })
  }
})

// Verify TOTP code against stored secret
authRouter.post('/verify-2fa', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).auth.userId as string
    const code = String((req.body as any)?.code || '')
    if (!code) return res.status(400).json({ error: 'missing_code' })

    // Fetch encrypted secret from server-managed table
    let storedB64: string | null = null
    try {
      storedB64 = await getTwoFactorSecret(userId)
    } catch (e) {
      return res.status(500).json({ error: 'secret_lookup_failed', details: (e as Error).message })
    }

    if (!storedB64) return res.status(400).json({ error: '2fa_not_enabled' })

    const buf = Buffer.from(storedB64, 'base64')
    const iv = buf.slice(0, 12)
    const tag = buf.slice(12, 28)
    const encrypted = buf.slice(28)

    const key = crypto.createHash('sha256').update(process.env.JWT_SECRET || 'dev-key').digest()
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
    decipher.setAuthTag(tag)
    const secret = Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8')

    const ok = authenticator.check(code, secret)
    if (!ok) return res.status(400).json({ error: 'invalid_code' })

    return res.json({ ok: true })
  } catch (e) {
    return res.status(500).json({ error: 'verify_2fa_failed', details: (e as Error).message })
  }
})

// Social login scaffold — server-side callback handler placeholder
authRouter.post('/social', async (req, res) => {
  return res.status(501).json({ error: 'not_implemented', message: 'Social login server-side flow not implemented. Use Supabase OAuth client flows or add provider-specific implementation.' })
})

