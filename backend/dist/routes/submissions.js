"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submissionsRouter = void 0;
const express_1 = require("express");
const supabaseAdmin_1 = require("../supabaseAdmin");
const requireAuth_1 = require("../middleware/requireAuth");
const requireActiveSubscription_1 = require("../middleware/requireActiveSubscription");
exports.submissionsRouter = (0, express_1.Router)();
// POST /api/submissions
exports.submissionsRouter.post('/', requireAuth_1.requireAuth, requireActiveSubscription_1.requireActiveSubscription, async (req, res) => {
    const studentId = req.auth.userId;
    const { assignment_id, file_url } = req.body;
    if (!assignment_id || !file_url)
        return res.status(400).json({ error: 'missing_assignment_id_or_file_url' });
    // Basic upsert: one submission per (student, assignment)
    const { data, error } = await supabaseAdmin_1.supabaseAdmin
        .from('submissions')
        .upsert({
        student_id: studentId,
        assignment_id,
        file_url,
        grade: null,
        feedback: null,
    }, { onConflict: 'student_id,assignment_id' })
        .select('student_id,assignment_id,file_url,grade,feedback');
    if (error)
        return res.status(400).json({ error: 'submission_failed', details: error.message });
    return res.json({ submission: data?.[0] });
});
