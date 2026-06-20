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
    const { data, error } = await supabaseAdmin_1.supabaseAdmin
        .from('profiles')
        .select('id,name,role,country,phone,avatar')
        .eq('id', id)
        .maybeSingle();
    if (error) {
        // Unexpected DB error
        console.error('Profile lookup error:', error);
        return res.status(500).json({ error: 'profile_lookup_failed' });
    }
    // If profile does not exist, return 200 with profile: null so clients can
    // handle creation/update flows without receiving a 404 that triggers errors.
    return res.json({ profile: data ?? null });
});
const zod_1 = require("zod");
const validate_1 = require("../middleware/validate");
const ProfilePatchSchema = zod_1.z.object({
    name: zod_1.z.string().max(200).nullable().optional(),
    role: zod_1.z.enum(['student', 'teacher', 'admin']).optional(),
    country: zod_1.z.string().max(200).nullable().optional(),
    phone: zod_1.z.string().max(50).nullable().optional(),
    avatar: zod_1.z.string().max(1000).nullable().optional(),
});
exports.profileRouter.patch('/:id', requireAuth_1.requireAuth, (0, validate_1.validateBody)(ProfilePatchSchema), async (req, res) => {
    const { id } = req.params;
    const userId = req.auth.userId;
    if (id !== userId)
        return res.status(403).json({ error: 'forbidden' });
    const patch = req.body;
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
