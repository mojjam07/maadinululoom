"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enrollmentsRouter = void 0;
const express_1 = require("express");
const supabaseAdmin_1 = require("../supabaseAdmin");
const requireAuth_1 = require("../middleware/requireAuth");
exports.enrollmentsRouter = (0, express_1.Router)();
exports.enrollmentsRouter.post('/', requireAuth_1.requireAuth, async (req, res) => {
    const userId = req.auth.userId;
    const { student_id, subject_id, status } = req.body;
    if (!subject_id)
        return res.status(400).json({ error: 'missing_subject_id' });
    const finalStudentId = student_id || userId;
    if (finalStudentId !== userId)
        return res.status(403).json({ error: 'forbidden' });
    const { data, error } = await supabaseAdmin_1.supabaseAdmin.from('enrollments').insert({
        student_id: finalStudentId,
        subject_id,
        status: status || 'active',
        enrolled_at: new Date().toISOString(),
    }).select('student_id,subject_id,status,enrolled_at');
    if (error)
        return res.status(400).json({ error: 'enrollment_failed', details: error.message });
    return res.json({ enrollment: data?.[0] });
});
