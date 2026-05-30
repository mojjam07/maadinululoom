import { Router } from 'express';
import { supabaseAdmin } from '../supabaseAdmin';
import { requireAuth } from '../middleware/requireAuth';
export const enrollmentsRouter = Router();
enrollmentsRouter.post('/', requireAuth, async (req, res) => {
    const userId = req.auth.userId;
    const { student_id, subject_id, status } = req.body;
    if (!subject_id)
        return res.status(400).json({ error: 'missing_subject_id' });
    const finalStudentId = student_id || userId;
    if (finalStudentId !== userId)
        return res.status(403).json({ error: 'forbidden' });
    const { data, error } = await supabaseAdmin.from('enrollments').insert({
        student_id: finalStudentId,
        subject_id,
        status: status || 'active',
        enrolled_at: new Date().toISOString(),
    }).select('student_id,subject_id,status,enrolled_at');
    if (error)
        return res.status(400).json({ error: 'enrollment_failed', details: error.message });
    return res.json({ enrollment: data?.[0] });
});
