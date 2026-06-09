"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileRouter = void 0;
const express_1 = require("express");
const supabaseAdmin_1 = require("../supabaseAdmin");
const requireAuth_1 = require("../middleware/requireAuth");
exports.profileRouter = (0, express_1.Router)();
exports.profileRouter.get('/:id', requireAuth_1.requireAuth, async (req, res) => {
    const { id } = req.params;
    // RLS should enforce proper access; we still scope by auth user for extra safety.
    const userId = req.auth.userId;
    if (id !== userId)
        return res.status(403).json({ error: 'forbidden' });
    const { data, error } = await supabaseAdmin_1.supabaseAdmin.from('profiles').select('id,name,role,country,phone,avatar').eq('id', id).single();
    if (error)
        return res.status(404).json({ error: 'profile_not_found' });
    return res.json({ profile: data });
});
exports.profileRouter.patch('/:id', requireAuth_1.requireAuth, async (req, res) => {
    const { id } = req.params;
    const userId = req.auth.userId;
    if (id !== userId)
        return res.status(403).json({ error: 'forbidden' });
    const allowed = ['name', 'role', 'country', 'phone', 'avatar'];
    const patch = {};
    for (const k of allowed) {
        if (k in req.body)
            patch[k] = req.body[k];
    }
    // Use upsert to create the profile row if it doesn't exist yet (client-side signups may not create it)
    const upsertBody = { id, ...patch };
    const { data, error } = await supabaseAdmin_1.supabaseAdmin
        .from('profiles')
        .upsert(upsertBody, { onConflict: 'id' })
        .select('id,name,role,country,phone,avatar')
        .single();
    if (error)
        return res.status(400).json({ error: 'profile_update_failed', details: error.message });
    return res.json({ profile: data });
});
