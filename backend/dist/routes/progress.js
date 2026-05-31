"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.progressRouter = void 0;
const express_1 = require("express");
const supabaseAdmin_1 = require("../supabaseAdmin");
const requireAuth_1 = require("../middleware/requireAuth");
const requireActiveSubscription_1 = require("../middleware/requireActiveSubscription");
exports.progressRouter = (0, express_1.Router)();
// PATCH /api/progress/:lessonId
exports.progressRouter.patch('/:lessonId', requireAuth_1.requireAuth, requireActiveSubscription_1.requireActiveSubscription, async (req, res) => {
    const { lessonId } = req.params;
    const studentId = req.auth.userId;
    const { completed } = req.body;
    if (typeof completed !== 'boolean')
        return res.status(400).json({ error: 'missing_completed_boolean' });
    const watchedAt = completed ? new Date().toISOString() : null;
    const { data, error } = await supabaseAdmin_1.supabaseAdmin
        .from('lesson_progress')
        .upsert({
        student_id: studentId,
        lesson_id: lessonId,
        completed,
        watched_at: watchedAt,
    }, { onConflict: 'student_id,lesson_id' })
        .select('student_id,lesson_id,completed,watched_at');
    if (error)
        return res.status(400).json({ error: 'progress_update_failed', details: error.message });
    return res.json({ progress: data?.[0] });
});
