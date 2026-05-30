import { Router } from 'express';
import { supabaseAdmin } from '../supabaseAdmin';
import { requireAuth } from '../middleware/requireAuth';
import { requireActiveSubscription } from '../middleware/requireActiveSubscription';
export const lessonsRouter = Router();
// GET /api/lessons/:subjectId
lessonsRouter.get('/:subjectId', requireAuth, requireActiveSubscription, async (req, res) => {
    const { subjectId } = req.params;
    const { data, error } = await supabaseAdmin
        .from('lessons')
        .select('id, subject_id, title, video_url, notes_url, duration')
        .eq('subject_id', subjectId)
        .order('id');
    if (error)
        return res.status(400).json({ error: 'lessons_failed', details: error.message });
    return res.json({ lessons: data || [] });
});
