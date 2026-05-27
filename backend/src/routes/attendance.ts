import { Router } from 'express'
import { supabaseAdmin } from '../supabaseAdmin'
import { requireAuth } from '../middleware/requireAuth'

export const attendanceRouter = Router()

// GET /api/attendance/:studentId
attendanceRouter.get('/:studentId', requireAuth, async (req, res) => {
  const { studentId } = req.params
  const userId = (req as any).auth.userId as string
  if (studentId !== userId) return res.status(403).json({ error: 'forbidden' })

  const { data, error } = await supabaseAdmin
    .from('attendance')
    .select('student_id,class_id,joined_at,duration_mins')
    .eq('student_id', studentId)
    .order('joined_at', { ascending: false })

  if (error) return res.status(400).json({ error: 'attendance_failed', details: error.message })
  return res.json({ attendance: data || [] })
})

