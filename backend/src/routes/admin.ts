import { Router } from 'express'
import { supabaseAdmin } from '../supabaseAdmin'
import { requireAuth } from '../middleware/requireAuth'
import { createMeeting } from '../services/zoom'

export const adminRouter = Router()

async function getRole(userId: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin.from('profiles').select('role').eq('id', userId).maybeSingle()
  if (error) return null
  return data?.role ?? null
}

function requireAdmin(role: string | null): boolean {
  return role === 'admin'
}

// GET /api/admin/classes
adminRouter.get('/classes', requireAuth, async (req, res) => {
  const actorId = (req as any).auth.userId as string
  const role = await getRole(actorId)
  if (!requireAdmin(role)) return res.status(403).json({ error: 'forbidden' })

  const { data, error } = await supabaseAdmin
    .from('classes')
    .select('id, topic, start_time, duration_mins, zoom_link, recording_url, canceled_at, teacher_profile_id')
    .order('start_time', { ascending: false })

  if (error) return res.status(400).json({ error: 'classes_failed', details: error.message })
  return res.json({ classes: data || [] })
})

// POST /api/admin/classes
adminRouter.post('/classes', requireAuth, async (req, res) => {
  const actorId = (req as any).auth.userId as string
  const role = await getRole(actorId)
  if (!requireAdmin(role)) return res.status(403).json({ error: 'forbidden' })

  const { topic, start_time, duration_mins, timezone, teacher_profile_id } = req.body as {
    topic?: string
    start_time?: string
    duration_mins?: number
    timezone?: string
    teacher_profile_id?: string
  }

  if (!topic || !start_time || !duration_mins) return res.status(400).json({ error: 'missing_topic_start_time_or_duration' })

  let zoom
  try {
    zoom = await createMeeting({
      topic,
      startTime: new Date(start_time).toISOString(),
      durationMins: duration_mins,
      timezone,
    })
  } catch (e) {
    return res.status(500).json({ error: 'zoom_create_failed', details: (e as Error).message })
  }

  const { data, error } = await supabaseAdmin
    .from('classes')
    .insert({
      topic,
      start_time: new Date(start_time).toISOString(),
      duration_mins,
      zoom_link: zoom.zoom_join_url,
      zoom_meeting_id: zoom.zoom_meeting_id,
      teacher_profile_id: teacher_profile_id || null,
      canceled_at: null,
      recording_url: null,
    })
    .select('id, topic, start_time, duration_mins, zoom_link, recording_url, canceled_at, teacher_profile_id')
    .single()

  if (error) return res.status(400).json({ error: 'class_create_failed', details: error.message })
  return res.json({ class: data })
})

// PATCH /api/admin/classes/:classId
adminRouter.patch('/classes/:classId', requireAuth, async (req, res) => {
  const actorId = (req as any).auth.userId as string
  const role = await getRole(actorId)
  if (!requireAdmin(role)) return res.status(403).json({ error: 'forbidden' })

  const { classId } = req.params
  const { start_time, duration_mins, canceled_at } = req.body as {
    start_time?: string | null
    duration_mins?: number | null
    canceled_at?: string | null
  }

  const patch: Record<string, unknown> = {}
  if (start_time !== undefined) patch.start_time = start_time ? new Date(start_time).toISOString() : null
  if (duration_mins !== undefined) patch.duration_mins = duration_mins
  if (canceled_at !== undefined) patch.canceled_at = canceled_at ? new Date(canceled_at).toISOString() : null

  const { data, error } = await supabaseAdmin
    .from('classes')
    .update(patch)
    .eq('id', classId)
    .select('id, topic, start_time, duration_mins, zoom_link, recording_url, canceled_at, teacher_profile_id')
    .single()

  if (error) return res.status(400).json({ error: 'class_update_failed', details: error.message })
  return res.json({ class: data })
})

