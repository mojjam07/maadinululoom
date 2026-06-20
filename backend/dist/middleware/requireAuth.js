"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const supabaseAdmin_1 = require("../supabaseAdmin");
// Verifies Supabase Auth access token by asking Supabase admin for the user.
// Attaches userId, role and email_verified to `req.auth` for downstream handlers.
async function requireAuth(req, res, next) {
    try {
        const auth = req.headers.authorization;
        if (!auth || !auth.startsWith('Bearer '))
            return res.status(401).json({ error: 'missing_bearer' });
        const token = auth.slice('Bearer '.length);
        const { data, error } = await supabaseAdmin_1.supabaseAdmin.auth.getUser(token);
        if (error || !data?.user)
            return res.status(401).json({ error: 'invalid_token' });
        const userId = data.user.id;
        // Fetch profile row to get role and other metadata
        const { data: profile, error: profErr } = await supabaseAdmin_1.supabaseAdmin.from('profiles').select('id,role').eq('id', userId).maybeSingle();
        const role = profile?.role ?? data.user.user_metadata?.role ?? null;
        req.auth = { userId, role, emailVerified: !!data.user.email_confirmed_at };
        next();
    }
    catch (e) {
        console.error('requireAuth error', e);
        return res.status(401).json({ error: 'unauthorized' });
    }
}
