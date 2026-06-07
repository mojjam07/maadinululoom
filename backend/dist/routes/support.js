"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supportRouter = void 0;
const express_1 = require("express");
const supabaseAdmin_1 = require("../supabaseAdmin");
const requireAuth_1 = require("../middleware/requireAuth");
exports.supportRouter = (0, express_1.Router)();
// POST /api/contact
exports.supportRouter.post('/contact', async (req, res) => {
    const { name, email, phone, message, source } = req.body;
    if (!name || typeof name !== 'string')
        return res.status(400).json({ error: 'missing_name' });
    if (!message || typeof message !== 'string')
        return res.status(400).json({ error: 'missing_message' });
    const { error } = await supabaseAdmin_1.supabaseAdmin.from('contact_messages').insert({
        name,
        email: email || null,
        phone: phone || null,
        message,
        source: source || 'landing',
    });
    if (error)
        return res.status(400).json({ error: 'contact_insert_failed', details: error.message });
    return res.json({ ok: true });
});
// GET /api/testimonials (public)
exports.supportRouter.get('/testimonials', async (_req, res) => {
    const { data, error } = await supabaseAdmin_1.supabaseAdmin
        .from('testimonials')
        .select('stars, text, avatar, name, country, role, created_at')
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(50);
    if (error) {
        const details = error.message || 'unknown_error';
        // If schema/migration hasn't been applied yet, the table may not exist.
        // In that case, degrade gracefully for landing page.
        if (details.toLowerCase().includes("could not find the table") || details.toLowerCase().includes('relation "testimonials" does not exist')) {
            return res.status(200).json({ testimonials: [] });
        }
        return res.status(500).json({ error: 'testimonials_failed', details });
    }
    return res.json({ testimonials: data || [] });
});
// POST /api/testimonials/me (student dashboard)
// NOTE: not yet wired to a UI in this task; this endpoint is for future dashboard wiring.
exports.supportRouter.post('/testimonials/me', requireAuth_1.requireAuth, async (req, res) => {
    const studentId = req.auth.userId;
    const { stars, text, avatar, name, country, role, } = req.body;
    if (!text || typeof text !== 'string')
        return res.status(400).json({ error: 'missing_text' });
    const payload = {
        student_id: studentId,
        stars: typeof stars === 'number' ? stars : null,
        text,
        avatar: avatar || null,
        name: name || null,
        country: country || null,
        role: role || null,
        is_approved: true,
    };
    const { error } = await supabaseAdmin_1.supabaseAdmin.from('testimonials').insert(payload);
    if (error)
        return res.status(400).json({ error: 'testimonial_insert_failed', details: error.message });
    return res.json({ ok: true });
});
