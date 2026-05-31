"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.teacherRouter = void 0;
const express_1 = require("express");
const supabaseAdmin_1 = require("../supabaseAdmin");
const requireAuth_1 = require("../middleware/requireAuth");
// Teacher portal endpoints (Phase 3 extra)
exports.teacherRouter = (0, express_1.Router)();
// Helpers
function getTeacherIdFromProfile(profileId) {
    return supabaseAdmin_1.supabaseAdmin
        .from('teachers')
        .select('id, profile_id')
        .eq('profile_id', profileId)
        .maybeSingle();
}
// POST /api/teacher/lessons
// body: { subject_id, title, video_url, notes_url, duration }
exports.teacherRouter.post('/lessons', requireAuth_1.requireAuth, async (req, res) => {
    const profileId = req.auth.userId;
    const { subject_id, title, video_url, notes_url, duration } = req.body;
    if (!subject_id || !title)
        return res.status(400).json({ error: 'missing_subject_id_or_title' });
    // Ensure teacher is assigned to this subject
    const { data: teacherRow, error: teacherErr } = await supabaseAdmin_1.supabaseAdmin
        .from('teachers')
        .select('id')
        .eq('profile_id', profileId)
        .maybeSingle();
    if (teacherErr || !teacherRow)
        return res.status(403).json({ error: 'not_a_teacher' });
    const { data: canTeach, error: canErr } = await supabaseAdmin_1.supabaseAdmin
        .from('teacher_subjects')
        .select('teacher_id')
        .eq('teacher_id', teacherRow.id)
        .eq('subject_id', subject_id)
        .maybeSingle();
    if (canErr || !canTeach)
        return res.status(403).json({ error: 'forbidden_subject' });
    const { data, error } = await supabaseAdmin_1.supabaseAdmin
        .from('lessons')
        .insert({
        subject_id,
        title,
        video_url: video_url || null,
        notes_url: notes_url || null,
        duration: duration ?? null,
    })
        .select('id, subject_id, title, video_url, notes_url, duration')
        .single();
    if (error)
        return res.status(400).json({ error: 'lesson_upload_failed', details: error.message });
    return res.json({ lesson: data });
});
// POST /api/teacher/assignments
// body: { lesson_id, title, due_date, instructions }
exports.teacherRouter.post('/assignments', requireAuth_1.requireAuth, async (req, res) => {
    const profileId = req.auth.userId;
    const { lesson_id, title, due_date, instructions } = req.body;
    if (!lesson_id || !title)
        return res.status(400).json({ error: 'missing_lesson_id_or_title' });
    const { data: teacherRow, error: teacherErr } = await supabaseAdmin_1.supabaseAdmin
        .from('teachers')
        .select('id')
        .eq('profile_id', profileId)
        .maybeSingle();
    if (teacherErr || !teacherRow)
        return res.status(403).json({ error: 'not_a_teacher' });
    // Ensure teacher can teach the lesson's subject
    const { data: lessonRow, error: lessonErr } = await supabaseAdmin_1.supabaseAdmin
        .from('lessons')
        .select('id, subject_id')
        .eq('id', lesson_id)
        .maybeSingle();
    if (lessonErr || !lessonRow)
        return res.status(404).json({ error: 'lesson_not_found' });
    const { data: canTeach, error: canErr } = await supabaseAdmin_1.supabaseAdmin
        .from('teacher_subjects')
        .select('teacher_id')
        .eq('teacher_id', teacherRow.id)
        .eq('subject_id', lessonRow.subject_id)
        .maybeSingle();
    if (canErr || !canTeach)
        return res.status(403).json({ error: 'forbidden_subject' });
    const { data, error } = await supabaseAdmin_1.supabaseAdmin
        .from('assignments')
        .insert({
        lesson_id,
        title,
        due_date: due_date ? new Date(due_date).toISOString() : null,
        instructions: instructions || null,
    })
        .select('id, lesson_id, title, due_date, instructions')
        .single();
    if (error)
        return res.status(400).json({ error: 'assignment_create_failed', details: error.message });
    return res.json({ assignment: data });
});
// PATCH /api/teacher/submissions/:studentId/:assignmentId
// body: { grade, feedback }
exports.teacherRouter.patch('/submissions/:studentId/:assignmentId', requireAuth_1.requireAuth, async (req, res) => {
    const profileId = req.auth.userId;
    const { studentId, assignmentId } = req.params;
    const { grade, feedback } = req.body;
    if (grade === undefined && feedback === undefined)
        return res.status(400).json({ error: 'missing_grade_or_feedback' });
    // Ensure teacher is assigned to subject of this assignment's lesson
    const { data: teacherRow, error: teacherErr } = await supabaseAdmin_1.supabaseAdmin
        .from('teachers')
        .select('id')
        .eq('profile_id', profileId)
        .maybeSingle();
    if (teacherErr || !teacherRow)
        return res.status(403).json({ error: 'not_a_teacher' });
    const { data: assignmentRow, error: asgErr } = await supabaseAdmin_1.supabaseAdmin
        .from('assignments')
        .select('id, lesson_id')
        .eq('id', assignmentId)
        .maybeSingle();
    if (asgErr || !assignmentRow)
        return res.status(404).json({ error: 'assignment_not_found' });
    const { data: lessonRow, error: lesErr } = await supabaseAdmin_1.supabaseAdmin
        .from('lessons')
        .select('id, subject_id')
        .eq('id', assignmentRow.lesson_id)
        .maybeSingle();
    if (lesErr || !lessonRow)
        return res.status(404).json({ error: 'lesson_not_found' });
    const { data: canTeach, error: canErr } = await supabaseAdmin_1.supabaseAdmin
        .from('teacher_subjects')
        .select('teacher_id')
        .eq('teacher_id', teacherRow.id)
        .eq('subject_id', lessonRow.subject_id)
        .maybeSingle();
    if (canErr || !canTeach)
        return res.status(403).json({ error: 'forbidden_subject' });
    const { data, error } = await supabaseAdmin_1.supabaseAdmin
        .from('submissions')
        .update({
        grade: grade ?? null,
        feedback: feedback ?? null,
    })
        .eq('student_id', studentId)
        .eq('assignment_id', assignmentId)
        .select('student_id,assignment_id,file_url,grade,feedback')
        .maybeSingle();
    if (error)
        return res.status(400).json({ error: 'submission_grade_failed', details: error.message });
    return res.json({ submission: data });
});
