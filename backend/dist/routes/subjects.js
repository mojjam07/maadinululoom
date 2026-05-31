"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subjectsRouter = void 0;
const express_1 = require("express");
const supabaseAdmin_1 = require("../supabaseAdmin");
exports.subjectsRouter = (0, express_1.Router)();
exports.subjectsRouter.get('/', async (_req, res) => {
    const { data, error } = await supabaseAdmin_1.supabaseAdmin.from('subjects').select('id, name_ar, name_en, description, icon').order('id');
    if (error)
        return res.status(500).json({ error: 'subjects_failed' });
    return res.json({ subjects: data || [] });
});
