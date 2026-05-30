import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { runClassRemindersOnce } from '../jobs/reminders';
import { supabaseAdmin } from '../supabaseAdmin';
export const remindersRouter = Router();
async function isAdmin(userId) {
    const { data } = await supabaseAdmin.from('profiles').select('role').eq('id', userId).maybeSingle();
    return data?.role === 'admin';
}
// POST /api/reminders/run (manual trigger)
remindersRouter.post('/run', requireAuth, async (req, res) => {
    const userId = req.auth.userId;
    const adminOnly = process.env.REMINDERS_ADMIN_ONLY === 'true';
    if (adminOnly) {
        const ok = await isAdmin(userId);
        if (!ok)
            return res.status(403).json({ error: 'forbidden' });
    }
    const { inserted } = await runClassRemindersOnce();
    return res.json({ ok: true, inserted });
});
