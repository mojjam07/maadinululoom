"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireActiveSubscription = requireActiveSubscription;
const supabaseAdmin_1 = require("../supabaseAdmin");
const GRACE_DAYS = 3;
function isInGrace(expiresAt, now) {
    const graceEnd = new Date(expiresAt.getTime() + GRACE_DAYS * 24 * 60 * 60 * 1000);
    return now.getTime() <= graceEnd.getTime();
}
async function requireActiveSubscription(req, res, next) {
    try {
        const userId = req.auth?.userId;
        if (!userId)
            return res.status(401).json({ error: 'missing_user' });
        const now = new Date();
        // Latest subscription row for the student.
        const { data: sub, error } = await supabaseAdmin_1.supabaseAdmin
            .from('subscriptions')
            .select('plan,status,expires_at,payment_ref')
            .eq('student_id', userId)
            .order('expires_at', { ascending: false })
            .limit(1)
            .maybeSingle();
        if (error)
            return res.status(500).json({ error: 'subscription_lookup_failed', details: error.message });
        if (!sub) {
            return res.status(402).json({ error: 'no_active_subscription' });
        }
        const expiresAt = sub.expires_at ? new Date(sub.expires_at) : null;
        const status = sub.status;
        const isActive = status === 'active' &&
            expiresAt !== null &&
            expiresAt.getTime() >= now.getTime();
        if (isActive)
            return next();
        const isGrace = status === 'active' &&
            expiresAt !== null &&
            isInGrace(expiresAt, now);
        if (isGrace) {
            ;
            req.subscriptionGrace = true;
            return next();
        }
        const graceEndsAt = expiresAt
            ? new Date(expiresAt.getTime() + GRACE_DAYS * 24 * 60 * 60 * 1000).toISOString()
            : null;
        return res.status(402).json({
            error: 'subscription_expired',
            expiresAt: sub.expires_at,
            graceEndsAt,
            plan: sub.plan,
        });
    }
    catch (e) {
        return res.status(500).json({ error: 'require_active_subscription_failed', details: e.message });
    }
}
