"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classesRouter = void 0;
const express_1 = require("express");
const supabaseAdmin_1 = require("../supabaseAdmin");
const requireAuth_1 = require("../middleware/requireAuth");
const zoom_1 = require("../services/zoom");
exports.classesRouter = (0, express_1.Router)();
async function getRole(userId) {
    const { data, error } = await supabaseAdmin_1.supabaseAdmin.from('profiles').select('role').eq('id', userId).maybeSingle();
    if (error)
        return null;
    return data?.role ?? null;
}
function requireAdminOrTeacher(role) {
    return role === 'admin' || role === 'teacher';
}
// Student: list classes the student is enrolled in
exports.classesRouter.get('/', requireAuth_1.requireAuth, async (req, res) => {
    const studentId = req.auth.userId;
    // First fetch class ids the student is enrolled in.
    const { data: enrollments, error: enrErr } = await supabaseAdmin_1.supabaseAdmin
        .from('class_enrollments')
        .select('class_id')
        .eq('student_id', studentId);
    if (enrErr)
        return res.status(400).json({ error: 'classes_failed', details: enrErr.message });
    const classIds = (enrollments || []).map((e) => e.class_id);
    if (classIds.length === 0)
        return res.json({ classes: [] });
    const { data: classes, error: clsErr } = await supabaseAdmin_1.supabaseAdmin
        .from('classes')
        .select('id, topic, start_time, duration_mins, zoom_link, recording_url, canceled_at')
        .in('id', classIds);
    if (clsErr)
        return res.status(400).json({ error: 'classes_failed', details: clsErr.message });
    return res.json({ classes: classes || [] });
});
// Admin/Teacher: create class + create zoom meeting
exports.classesRouter.post('/', requireAuth_1.requireAuth, async (req, res) => {
    const teacherOrAdminId = req.auth.userId;
    const role = await getRole(teacherOrAdminId);
    if (!requireAdminOrTeacher(role))
        return res.status(403).json({ error: 'forbidden' });
    const { topic, start_time, duration_mins, timezone, teacher_profile_id } = req.body;
    if (!topic || !start_time || !duration_mins)
        return res.status(400).json({ error: 'missing_topic_start_time_or_duration' });
    // Create Zoom meeting
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
        .select('id, topic, start_time, duration_mins, zoom_link, zoom_meeting_id, recording_url, canceled_at')
        .single();
    if (error)
        return res.status(400).json({ error: 'class_create_failed', details: error.message });
    return res.json({ class: data });
});
// Admin/Teacher: cancel/reschedule class
exports.classesRouter.patch('/:classId', requireAuth_1.requireAuth, async (req, res) => {
    const actorId = req.auth.userId;
    const role = await getRole(actorId);
    if (!requireAdminOrTeacher(role))
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
        .select('id, topic, start_time, duration_mins, zoom_link, recording_url, canceled_at')
        .single();
    if (error)
        return res.status(400).json({ error: 'class_update_failed', details: error.message });
    return res.json({ class: data });
});
