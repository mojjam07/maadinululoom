import { Router } from 'express'
import { supabaseAdmin } from '../supabaseAdmin'
import { requireAuth } from '../middleware/requireAuth'

export const profileRouter = Router()

profileRouter.get('/:id', requireAuth, async (req, res) => {
  const { id } = req.params

  // RLS should enforce proper access; we still scope by auth user for extra safety.
  const userId = (req as any).auth.userId
  if (id !== userId) return res.status(403).json({ error: 'forbidden' })

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id,name,role,country,phone,avatar')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    // Unexpected DB error
    console.error('Profile lookup error:', error)
    return res.status(500).json({ error: 'profile_lookup_failed' })
  }

  // If profile does not exist, return 200 with profile: null so clients can
  // handle creation/update flows without receiving a 404 that triggers errors.
  return res.json({ profile: data ?? null })
})

profileRouter.patch('/:id', requireAuth, async (req, res) => {
  const { id } = req.params
  const userId = (req as any).auth.userId
  if (id !== userId) return res.status(403).json({ error: 'forbidden' })

  const allowed = ['name', 'role', 'country', 'phone', 'avatar']
  const patch: Record<string, unknown> = {}
  for (const k of allowed) {
    if (k in req.body) patch[k] = (req.body as any)[k]
  }

  // Use upsert to create the profile row if it doesn't exist yet (client-side signups may not create it)
  const upsertBody = { id, ...(patch as Record<string, unknown>) }
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .upsert(upsertBody, { onConflict: 'id' })
    .select('id,name,role,country,phone,avatar')
    .single()

  if (error) return res.status(400).json({ error: 'profile_update_failed', details: error.message })

  return res.json({ profile: data })
})
