import { Router } from 'express'
import { supabaseAdmin } from '../supabaseAdmin'
import { requireAuth } from '../middleware/requireAuth'

export const submissionsRouter = Router()

// POST /api/submissions
submissionsRouter.post('/', requireAuth, async (req, res) => {
  const studentId = (req as any).auth.userId as string

  const { assignment_id, file_url } = req.body as { assignment_id?: string; file_url?: string }
  if (!assignment_id || !file_url) return res.status(400).json({ error: 'missing_assignment_id_or_file_url' })

  // Basic upsert: one submission per (student, assignment)
  const { data, error } = await supabaseAdmin
    .from('submissions')
    .upsert(
      {
        student_id: studentId,
        assignment_id,
        file_url,
        grade: null,
        feedback: null,
      },
      { onConflict: 'student_id,assignment_id' },
    )
    .select('student_id,assignment_id,file_url,grade,feedback')

  if (error) return res.status(400).json({ error: 'submission_failed', details: error.message })
  return res.json({ submission: data?.[0] })
})

