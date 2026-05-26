import { Router } from 'express'
import { supabaseAdmin } from '../supabaseAdmin'
import { requireAuth } from '../middleware/requireAuth'

export const profileRouter = Router()

profileRouter.get('/:id', requireAuth, async (req, res) => {
  const { id } = req.params

  // RLS should enforce proper access; we still scope by auth user for extra safety.
  const userId = (req as any).auth.userId
  if (id !== userId) return res.status(403).json({ error: 'forbidden' })

  const { data, error } = await supabaseAdmin.from('profiles').select('id,name,role,country,phone,avatar').eq('id', id).single()
  if (error) return res.status(404).json({ error: 'profile_not_found' })
  return res.json({ profile: data })
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

  const { data, error } = await supabaseAdmin.from('profiles').update(patch).eq('id', id).select('id,name,role,country,phone,avatar').single()
  if (error) return res.status(400).json({ error: 'profile_update_failed' })

  return res.json({ profile: data })
})
