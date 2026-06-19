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

import { z } from 'zod'
import { validateBody } from '../middleware/validate'

const ProfilePatchSchema = z.object({
  name: z.string().max(200).nullable().optional(),
  role: z.enum(['student', 'teacher', 'admin']).optional(),
  country: z.string().max(200).nullable().optional(),
  phone: z.string().max(50).nullable().optional(),
  avatar: z.string().max(1000).nullable().optional(),
})

profileRouter.patch('/:id', requireAuth, validateBody(ProfilePatchSchema), async (req, res) => {
  const { id } = req.params
  const userId = (req as any).auth.userId
  if (id !== userId) return res.status(403).json({ error: 'forbidden' })

  const patch: Record<string, unknown> = req.body

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
