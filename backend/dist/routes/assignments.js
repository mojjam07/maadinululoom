import { Router } from 'express';
import { supabaseAdmin } from '../supabaseAdmin';
import { requireAuth } from '../middleware/requireAuth';
import { requireActiveSubscription } from '../middleware/requireActiveSubscription';
export const assignmentsRouter = Router();
// GET /api/assignments/:studentId
assignmentsRouter.get('/:studentId', requireAuth, requireActiveSubscription, async (req, res) => {
    const { studentId } = req.params;
    const userId = req.auth.userId;
    if (studentId !== userId)
        return res.status(403).json({ error: 'forbidden' });
    // Student assignments are derived from enrolled subjects.
    // enrollments -> lessons -> assignments
    const { data: enrolled, error: enrErr } = await supabaseAdmin
        .from('enrollments')
        .select('subject_id')
        .eq('student_id', studentId);
    if (enrErr)
        return res.status(400).json({ error: 'assignments_failed', details: enrErr.message });
    const subjectIds = (enrolled || []).map((e) => e.subject_id);
    if (subjectIds.length === 0)
        return res.json({ assignments: [] });
    const { data: lessons, error: lesErr } = await supabaseAdmin
        .from('lessons')
        .select('id')
        .in('subject_id', subjectIds);
    if (lesErr)
        return res.status(400).json({ error: 'assignments_failed', details: lesErr.message });
    const lessonIds = (lessons || []).map((l) => l.id);
    if (lessonIds.length === 0)
        return res.json({ assignments: [] });
    const { data: asns, error: asErr } = await supabaseAdmin
        .from('assignments')
        .select('id, lesson_id, title, due_date, instructions')
        .in('lesson_id', lessonIds)
        .order('due_date', { ascending: true, nullsFirst: true });
    if (asErr)
        return res.status(400).json({ error: 'assignments_failed', details: asErr.message });
    return res.json({ assignments: asns || [] });
});
