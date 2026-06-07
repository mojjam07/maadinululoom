"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const supabaseAdmin_1 = require("../supabaseAdmin");
exports.authRouter = (0, express_1.Router)();
// Email/password sign-up
exports.authRouter.post('/register', async (req, res) => {
    const { email, password, role, name } = req.body;
    if (!email || !password)
        return res.status(400).json({ error: 'missing_email_or_password' });
    const signUpRole = role || 'student';
    const { data, error } = await supabaseAdmin_1.supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role: signUpRole, name: name || null },
    });
    if (error)
        return res.status(400).json({ error: 'register_failed', details: error.message });
    // Create profile row
    const userId = data.user.id;
    const { error: upErr } = await supabaseAdmin_1.supabaseAdmin.from('profiles').insert({
        id: userId,
        name: name || null,
        role: signUpRole,
        country: null,
        phone: null,
        avatar: null,
    });
    if (upErr)
        return res.status(400).json({ error: 'profile_create_failed', details: upErr.message });
    // For refresh-token handling in frontend, we will require explicit login to get session.
    return res.json({ ok: true, userId });
});
exports.authRouter.post('/login', async (req, res) => {
    // Client-side auth uses Supabase-js (anon key) to create a session.
    // This endpoint exists only for backward compatibility and will no longer 501.
    // Frontend should sign in directly with supabase.auth.signInWithPassword.
    return res.json({ ok: true, note: 'use_supabase_client_login' });
});
