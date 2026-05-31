"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.remindersRouter = void 0;
const express_1 = require("express");
const requireAuth_1 = require("../middleware/requireAuth");
const reminders_1 = require("../jobs/reminders");
const supabaseAdmin_1 = require("../supabaseAdmin");
exports.remindersRouter = (0, express_1.Router)();
async function isAdmin(userId) {
    const { data } = await supabaseAdmin_1.supabaseAdmin.from('profiles').select('role').eq('id', userId).maybeSingle();
    return data?.role === 'admin';
}
// POST /api/reminders/run (manual trigger)
exports.remindersRouter.post('/run', requireAuth_1.requireAuth, async (req, res) => {
    const userId = req.auth.userId;
    const adminOnly = process.env.REMINDERS_ADMIN_ONLY === 'true';
    if (adminOnly) {
        const ok = await isAdmin(userId);
        if (!ok)
            return res.status(403).json({ error: 'forbidden' });
    }
    const { inserted } = await (0, reminders_1.runClassRemindersOnce)();
    return res.json({ ok: true, inserted });
});
