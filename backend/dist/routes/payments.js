"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentsRouter = void 0;
const express_1 = require("express");
const supabaseAdmin_1 = require("../supabaseAdmin");
const requireAuth_1 = require("../middleware/requireAuth");
const crypto_1 = __importDefault(require("crypto"));
const zod_1 = require("zod");
const validate_1 = require("../middleware/validate");
exports.paymentsRouter = (0, express_1.Router)();
// POST /api/payments/create
// Creates a payments record with status 'pending' and returns a provider initialization
async function handleCreate(req, res) {
    const { provider, amount, currency, student_id, metadata, } = req.body;
    const prov = typeof provider === 'string' ? provider.toLowerCase() : null;
    if (!prov || (prov !== 'stripe' && prov !== 'paystack'))
        return res.status(400).json({ error: 'invalid_provider' });
    if (typeof amount !== 'number' || isNaN(amount) || amount <= 0)
        return res.status(400).json({ error: 'invalid_amount' });
    const paymentRef = `init_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    const cur = typeof currency === 'string' ? currency.toUpperCase() : prov === 'paystack' ? 'NGN' : 'USD';
    const payload = {
        id: crypto_1.default.randomUUID(),
        student_id: student_id || null,
        amount,
        currency: cur,
        provider: prov,
        // Schema enforces status in ('succeeded','failed') — use 'failed' for initial record
        status: 'failed',
        paid_at: null,
        payment_ref: paymentRef,
        metadata: Object.assign({ initialized_at: new Date().toISOString() }, metadata || {}),
    };
    // Validate student exists if provided
    if (student_id) {
        if (typeof student_id !== 'string' || student_id.trim().length === 0)
            return res.status(400).json({ error: 'invalid_student_id' });
        const { data: profile, error: profErr } = await supabaseAdmin_1.supabaseAdmin.from('profiles').select('id').eq('id', student_id).maybeSingle();
        if (profErr)
            return res.status(500).json({ error: 'profile_lookup_failed', details: profErr.message });
        if (!profile)
            return res.status(400).json({ error: 'student_not_found' });
        const { error } = await supabaseAdmin_1.supabaseAdmin.from('payments').insert(payload);
        if (error)
            return res.status(400).json({ error: 'payment_insert_failed', details: error.message });
    }
    // Provider initialization stub: real integration should call provider SDKs.
    const init = prov === 'stripe'
        ? { client_secret: `test_client_secret_${paymentRef}` }
        : { authorization_url: `https://paystack.com/pay/${paymentRef}` };
    return res.json({ ok: true, provider: prov, payment_ref: paymentRef, init });
}
const CreatePaymentSchema = zod_1.z.object({
    provider: zod_1.z.enum(['stripe', 'paystack']),
    amount: zod_1.z.number().positive(),
    currency: zod_1.z.string().min(3).max(4).optional(),
    student_id: zod_1.z.string().uuid().optional().nullable(),
    metadata: zod_1.z.any().optional(),
});
exports.paymentsRouter.post('/create', (0, validate_1.validateBody)(CreatePaymentSchema), handleCreate);
// Optional: create payment for authenticated student (dashboard)
exports.paymentsRouter.post('/create/me', requireAuth_1.requireAuth, async (req, res) => {
    const studentId = req.auth.userId;
    const body = Object.assign({}, req.body || {}, { student_id: studentId });
    req.body = body;
    return handleCreate(req, res);
});
