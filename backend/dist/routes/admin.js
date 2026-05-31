"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = void 0;
const express_1 = require("express");
const supabaseAdmin_1 = require("../supabaseAdmin");
const requireAuth_1 = require("../middleware/requireAuth");
const zoom_1 = require("../services/zoom");
exports.adminRouter = (0, express_1.Router)();
async function getRole(userId) {
    const { data, error } = await supabaseAdmin_1.supabaseAdmin.from('profiles').select('role').eq('id', userId).maybeSingle();
    if (error)
        return null;
    return data?.role ?? null;
}
function requireAdmin(role) {
    return role === 'admin';
}
// GET /api/admin/classes
exports.adminRouter.get('/classes', requireAuth_1.requireAuth, async (req, res) => {
    const actorId = req.auth.userId;
    const role = await getRole(actorId);
    if (!requireAdmin(role))
        return res.status(403).json({ error: 'forbidden' });
    const { data, error } = await supabaseAdmin_1.supabaseAdmin
        .from('classes')
        .select('id, topic, start_time, duration_mins, zoom_link, recording_url, canceled_at, teacher_profile_id')
        .order('start_time', { ascending: false });
    if (error)
        return res.status(400).json({ error: 'classes_failed', details: error.message });
    return res.json({ classes: data || [] });
});
// POST /api/admin/classes
exports.adminRouter.post('/classes', requireAuth_1.requireAuth, async (req, res) => {
    const actorId = req.auth.userId;
    const role = await getRole(actorId);
    if (!requireAdmin(role))
        return res.status(403).json({ error: 'forbidden' });
    const { topic, start_time, duration_mins, timezone, teacher_profile_id } = req.body;
    if (!topic || !start_time || !duration_mins)
        return res.status(400).json({ error: 'missing_topic_start_time_or_duration' });
    let zoom;
    try {
        zoom = await (0, zoom_1.createMeeting)({
            topic,
            startTime: new Date(start_time).toISOString(),
            durationMins: duration_mins,
            timezone,
        });
    }
    catch (e) {
        return res.status(500).json({ error: 'zoom_create_failed', details: e.message });
    }
    const { data, error } = await supabaseAdmin_1.supabaseAdmin
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
        .single();
    if (error)
        return res.status(400).json({ error: 'class_create_failed', details: error.message });
    return res.json({ class: data });
});
// PATCH /api/admin/classes/:classId
exports.adminRouter.patch('/classes/:classId', requireAuth_1.requireAuth, async (req, res) => {
    const actorId = req.auth.userId;
    const role = await getRole(actorId);
    if (!requireAdmin(role))
        return res.status(403).json({ error: 'forbidden' });
    const { classId } = req.params;
    const { start_time, duration_mins, canceled_at } = req.body;
    const patch = {};
    if (start_time !== undefined)
        patch.start_time = start_time ? new Date(start_time).toISOString() : null;
    if (duration_mins !== undefined)
        patch.duration_mins = duration_mins;
    if (canceled_at !== undefined)
        patch.canceled_at = canceled_at ? new Date(canceled_at).toISOString() : null;
    const { data, error } = await supabaseAdmin_1.supabaseAdmin
        .from('classes')
        .update(patch)
        .eq('id', classId)
        .select('id, topic, start_time, duration_mins, zoom_link, recording_url, canceled_at, teacher_profile_id')
        .single();
    if (error)
        return res.status(400).json({ error: 'class_update_failed', details: error.message });
    return res.json({ class: data });
});
