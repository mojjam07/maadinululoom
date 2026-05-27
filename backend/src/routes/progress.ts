import { Router } from 'express'
import { supabaseAdmin } from '../supabaseAdmin'
import { requireAuth } from '../middleware/requireAuth'

export const progressRouter = Router()

// PATCH /api/progress/:lessonId
progressRouter.patch('/:lessonId', requireAuth, async (req, res) => {
  const { lessonId } = req.params
  const studentId = (req as any).auth.userId as string

  const { completed } = req.body as { completed?: boolean }
  if (typeof completed !== 'boolean') return res.status(400).json({ error: 'missing_completed_boolean' })

  const watchedAt = completed ? new Date().toISOString() : null

  const { data, error } = await supabaseAdmin
    .from('lesson_progress')
    .upsert(
      {
        student_id: studentId,
        lesson_id: lessonId,
        completed,
        watched_at: watchedAt,
      },
      { onConflict: 'student_id,lesson_id' },
    )
    .select('student_id,lesson_id,completed,watched_at')

  if (error) return res.status(400).json({ error: 'progress_update_failed', details: error.message })
  return res.json({ progress: data?.[0] })
})

