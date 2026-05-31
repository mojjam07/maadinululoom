"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationsRouter = void 0;
const express_1 = require("express");
const supabaseAdmin_1 = require("../supabaseAdmin");
const requireAuth_1 = require("../middleware/requireAuth");
exports.notificationsRouter = (0, express_1.Router)();
// GET /api/notifications
exports.notificationsRouter.get('/', requireAuth_1.requireAuth, async (req, res) => {
    const userId = req.auth.userId;
    const { data, error } = await supabaseAdmin_1.supabaseAdmin
        .from('notifications')
        .select('id, user_id, type, title, body, created_at, read_at, metadata')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    if (error)
        return res.status(400).json({ error: 'notifications_failed', details: error.message });
    return res.json({ notifications: data || [] });
});
// PATCH /api/notifications/:notificationId/read
exports.notificationsRouter.patch('/:notificationId/read', requireAuth_1.requireAuth, async (req, res) => {
    const userId = req.auth.userId;
    const { notificationId } = req.params;
    const { data, error } = await supabaseAdmin_1.supabaseAdmin
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
