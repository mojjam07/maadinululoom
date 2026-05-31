"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attendanceRouter = void 0;
const express_1 = require("express");
const supabaseAdmin_1 = require("../supabaseAdmin");
const requireAuth_1 = require("../middleware/requireAuth");
const requireActiveSubscription_1 = require("../middleware/requireActiveSubscription");
exports.attendanceRouter = (0, express_1.Router)();
// GET /api/attendance/:studentId
exports.attendanceRouter.get('/:studentId', requireAuth_1.requireAuth, requireActiveSubscription_1.requireActiveSubscription, async (req, res) => {
    const { studentId } = req.params;
    const userId = req.auth.userId;
    if (studentId !== userId)
        return res.status(403).json({ error: 'forbidden' });
    const { data, error } = await supabaseAdmin_1.supabaseAdmin
        .from('attendance')
        .select('student_id,class_id,joined_at,duration_mins')
        .eq('student_id', studentId)
        .order('joined_at', { ascending: false });
    if (error)
        return res.status(400).json({ error: 'attendance_failed', details: error.message });
    return res.json({ attendance: data || [] });
});
