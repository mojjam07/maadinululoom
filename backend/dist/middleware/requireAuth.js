import { supabaseAdmin } from '../supabaseAdmin';
// Verifies Supabase Auth access token by asking Supabase admin for the user.
// This avoids needing local JWT verification dependencies.
export async function requireAuth(req, res, next) {
    try {
        const auth = req.headers.authorization;
        if (!auth || !auth.startsWith('Bearer '))
            return res.status(401).json({ error: 'missing_bearer' });
        const token = auth.slice('Bearer '.length);
        const { data, error } = await supabaseAdmin.auth.getUser(token);
        if (error || !data?.user)
            return res.status(401).json({ error: 'invalid_token' });
        req.auth = { userId: data.user.id };
        next();
    }
    catch {
        return res.status(401).json({ error: 'unauthorized' });
    }
}
