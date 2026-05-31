"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lessonsRouter = void 0;
const express_1 = require("express");
const supabaseAdmin_1 = require("../supabaseAdmin");
const requireAuth_1 = require("../middleware/requireAuth");
const requireActiveSubscription_1 = require("../middleware/requireActiveSubscription");
exports.lessonsRouter = (0, express_1.Router)();
// GET /api/lessons/:subjectId
exports.lessonsRouter.get('/:subjectId', requireAuth_1.requireAuth, requireActiveSubscription_1.requireActiveSubscription, async (req, res) => {
    const { subjectId } = req.params;
    const { data, error } = await supabaseAdmin_1.supabaseAdmin
        .from('lessons')
        .select('id, subject_id, title, video_url, notes_url, duration')
        .eq('subject_id', subjectId)
        .order('id');
    if (error)
        return res.status(400).json({ error: 'lessons_failed', details: error.message });
    return res.json({ lessons: data || [] });
});
