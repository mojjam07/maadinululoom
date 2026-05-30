import { Router } from 'express';
import { supabaseAdmin } from '../supabaseAdmin';
import { requireAuth } from '../middleware/requireAuth';
export const notificationsRouter = Router();
// GET /api/notifications
notificationsRouter.get('/', requireAuth, async (req, res) => {
    const userId = req.auth.userId;
    const { data, error } = await supabaseAdmin
        .from('notifications')
        .select('id, user_id, type, title, body, created_at, read_at, metadata')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    if (error)
        return res.status(400).json({ error: 'notifications_failed', details: error.message });
    return res.json({ notifications: data || [] });
});
// PATCH /api/notifications/:notificationId/read
notificationsRouter.patch('/:notificationId/read', requireAuth, async (req, res) => {
    const userId = req.auth.userId;
    const { notificationId } = req.params;
    const { data, error } = await supabaseAdmin
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', userId)
        .select('id, user_id, type, title, body, created_at, read_at, metadata, read')
        .maybeSingle();
    if (error)
        return res.status(400).json({ error: 'notification_mark_read_failed', details: error.message });
    return res.json({ notification: data });
});
