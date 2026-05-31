"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.quizzesRouter = void 0;
const express_1 = require("express");
const supabaseAdmin_1 = require("../supabaseAdmin");
const requireAuth_1 = require("../middleware/requireAuth");
exports.quizzesRouter = (0, express_1.Router)();
// Phase 6 scaffold endpoints.
// Full teacher builder + timed exams UI will be implemented in subsequent iterations.
// POST /api/quizzes/sets
// body: { lesson_id, title, description?, mode?, timed?, duration_secs?, passing_score? }
exports.quizzesRouter.post('/sets', requireAuth_1.requireAuth, async (req, res) => {
    const actorId = req.auth.userId;
    const { lesson_id, title, description, mode, timed, duration_secs, passing_score, } = req.body;
    if (!lesson_id || !title)
        return res.status(400).json({ error: 'missing_lesson_id_or_title' });
    const { data, error } = await supabaseAdmin_1.supabaseAdmin
        .from('quiz_sets')
        .insert({
        lesson_id,
        title,
        description: description ?? null,
        mode: mode ?? 'quiz',
        timed: timed ?? false,
        duration_secs: duration_secs ?? null,
        passing_score: passing_score ?? null,
        created_by_profile_id: actorId,
    })
        .select('*')
        .single();
    if (error)
        return res.status(400).json({ error: 'quiz_set_create_failed', details: error.message });
    return res.json({ quiz_set: data });
});
// GET /api/quizzes/sets/:quizSetId
exports.quizzesRouter.get('/sets/:quizSetId', async (req, res) => {
    const { quizSetId } = req.params;
    const { data, error } = await supabaseAdmin_1.supabaseAdmin
        .from('quiz_sets')
        .select('*')
        .eq('id', quizSetId)
        .maybeSingle();
    if (error)
        return res.status(400).json({ error: 'quiz_set_fetch_failed', details: error.message });
    if (!data)
        return res.status(404).json({ error: 'not_found' });
    const { data: questions } = await supabaseAdmin_1.supabaseAdmin
        .from('quiz_questions')
        .select('*')
        .eq('quiz_set_id', quizSetId)
        .order('position', { ascending: true });
    return res.json({ quiz_set: data, questions: questions || [] });
});
// POST /api/quizzes/attempts/:quizSetId/start
exports.quizzesRouter.post('/attempts/:quizSetId/start', requireAuth_1.requireAuth, async (req, res) => {
    const { quizSetId } = req.params;
    const studentId = req.auth.userId;
    // Start an attempt
    const { data: setRow } = await supabaseAdmin_1.supabaseAdmin
        .from('quiz_sets')
        .select('duration_secs')
        .eq('id', quizSetId)
        .maybeSingle();
    const { data, error } = await supabaseAdmin_1.supabaseAdmin
        .from('quiz_attempts')
        .insert({
        quiz_set_id: quizSetId,
        student_id: studentId,
        duration_secs: setRow?.duration_secs ?? null,
        status: 'in_progress',
        auto_scored: false,
    })
        .select('*')
        .single();
    if (error)
        return res.status(400).json({ error: 'attempt_start_failed', details: error.message });
    return res.json({ attempt: data });
});
// POST /api/quizzes/attempts/:attemptId/submit
exports.quizzesRouter.post('/attempts/:attemptId/submit', requireAuth_1.requireAuth, async (req, res) => {
    const { attemptId } = req.params;
    const studentId = req.auth.userId;
    const { is_submitted } = req.body;
    if (is_submitted !== undefined && typeof is_submitted !== 'boolean') {
        return res.status(400).json({ error: 'invalid_is_submitted' });
    }
    // Phase 6: scaffold only.
    // Future: accept MCQ/short responses and compute grading + results.
    const { data, error } = await supabaseAdmin_1.supabaseAdmin
        .from('quiz_attempts')
        .update({
        finished_at: new Date().toISOString(),
        status: 'submitted',
    })
        .eq('id', attemptId)
        .eq('student_id', studentId)
        .select('*')
        .maybeSingle();
    if (error)
        return res.status(400).json({ error: 'attempt_submit_failed', details: error.message });
    if (!data)
        return res.status(404).json({ error: 'attempt_not_found' });
    return res.json({ attempt: data, message: 'submitted (grading scaffold)' });
});
