"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignmentsRouter = void 0;
const express_1 = require("express");
const supabaseAdmin_1 = require("../supabaseAdmin");
const requireAuth_1 = require("../middleware/requireAuth");
const requireActiveSubscription_1 = require("../middleware/requireActiveSubscription");
exports.assignmentsRouter = (0, express_1.Router)();
// GET /api/assignments/:studentId
exports.assignmentsRouter.get('/:studentId', requireAuth_1.requireAuth, requireActiveSubscription_1.requireActiveSubscription, async (req, res) => {
    const { studentId } = req.params;
    const userId = req.auth.userId;
    if (studentId !== userId)
        return res.status(403).json({ error: 'forbidden' });
    // Student assignments are derived from enrolled subjects.
    // enrollments -> lessons -> assignments
    const { data: enrolled, error: enrErr } = await supabaseAdmin_1.supabaseAdmin
        .from('enrollments')
        .select('subject_id')
        .eq('student_id', studentId);
    if (enrErr)
        return res.status(400).json({ error: 'assignments_failed', details: enrErr.message });
    const subjectIds = (enrolled || []).map((e) => e.subject_id);
    if (subjectIds.length === 0)
        return res.json({ assignments: [] });
    const { data: lessons, error: lesErr } = await supabaseAdmin_1.supabaseAdmin
        .from('lessons')
        .select('id')
        .in('subject_id', subjectIds);
    if (lesErr)
        return res.status(400).json({ error: 'assignments_failed', details: lesErr.message });
    const lessonIds = (lessons || []).map((l) => l.id);
    if (lessonIds.length === 0)
        return res.json({ assignments: [] });
    const { data: asns, error: asErr } = await supabaseAdmin_1.supabaseAdmin
        .from('assignments')
        .select('id, lesson_id, title, due_date, instructions')
        .in('lesson_id', lessonIds)
        .order('due_date', { ascending: true, nullsFirst: true });
    if (asErr)
        return res.status(400).json({ error: 'assignments_failed', details: asErr.message });
    return res.json({ assignments: asns || [] });
});
