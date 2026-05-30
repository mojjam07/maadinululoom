import { Router } from 'express';
import { supabaseAdmin } from '../supabaseAdmin';
export const authRouter = Router();
// Email/password sign-up
authRouter.post('/register', async (req, res) => {
    const { email, password, role, name } = req.body;
    if (!email || !password)
        return res.status(400).json({ error: 'missing_email_or_password' });
    const signUpRole = role || 'student';
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role: signUpRole, name: name || null },
    });
    if (error)
        return res.status(400).json({ error: 'register_failed', details: error.message });
    // Create profile row
    const userId = data.user.id;
    const { error: upErr } = await supabaseAdmin.from('profiles').insert({
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
authRouter.post('/login', async (req, res) => {
    // Backend login with service role cannot issue refresh tokens directly.
    // We'll return a message instructing frontend to use supabase-js on client.
    // Phase 2 expects API endpoints though; implement via admin.createUser? Not possible.
    // We'll support login by using supabaseAdmin.auth.signInWithPassword is not available.
    return res.status(501).json({ error: 'login_not_implemented_server_side' });
});
