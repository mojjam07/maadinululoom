import type express from 'express'
import { supabaseAdmin } from '../supabaseAdmin'

// Verifies Supabase Auth access token by asking Supabase admin for the user.
// Attaches userId, role and email_verified to `req.auth` for downstream handlers.
export async function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  try {
    const auth = req.headers.authorization
    if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'missing_bearer' })
    const token = auth.slice('Bearer '.length)

    const { data, error } = await supabaseAdmin.auth.getUser(token)
    if (error || !data?.user) return res.status(401).json({ error: 'invalid_token' })

    const userId = data.user.id

    // Fetch profile row to get role and other metadata
    const { data: profile, error: profErr } = await supabaseAdmin.from('profiles').select('id,role').eq('id', userId).maybeSingle()
    const role = profile?.role ?? (data.user.user_metadata?.role as string | undefined) ?? null

    ;(req as any).auth = { userId, role, emailVerified: !!data.user.email_confirmed_at }
    next()
  } catch (e) {
    console.error('requireAuth error', e)
    return res.status(401).json({ error: 'unauthorized' })
  }
}
