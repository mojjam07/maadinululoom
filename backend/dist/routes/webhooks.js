"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhooksRouter = void 0;
const express_1 = __importDefault(require("express"));
const crypto_1 = __importDefault(require("crypto"));
const stripe_1 = __importDefault(require("stripe"));
const paystack_1 = require("../services/payments/paystack");
const stripe_2 = require("../services/payments/stripe");
exports.webhooksRouter = express_1.default.Router();
// Use route-level raw parsing so we can verify signatures before parsing JSON
const RAW_OPTIONS = { limit: '1mb', type: '*/*' };
exports.webhooksRouter.post('/paystack', express_1.default.raw(RAW_OPTIONS), async (req, res) => {
    try {
        const secret = process.env.PAYSTACK_WEBHOOK_SECRET;
        const header = req.headers['x-paystack-signature'] || req.headers['x-paystack-signature'];
        if (!secret) {
            if (process.env.NODE_ENV === 'production') {
                return res.status(500).json({ error: 'missing_paystack_webhook_secret' });
            }
            console.warn('PAYSTACK_WEBHOOK_SECRET not set - webhook signature verification disabled (non-production)');
        }
        else {
            if (!header)
                return res.status(400).json({ error: 'missing_paystack_signature_header' });
            const expected = crypto_1.default.createHmac('sha512', secret).update(req.body).digest('hex');
            if (expected !== header)
                return res.status(400).json({ error: 'invalid_paystack_signature' });
        }
        const parsed = JSON.parse(req.body.toString('utf8'));
        req.body = parsed;
        await (0, paystack_1.handlePaystackWebhook)(req, res);
        return res.json({ ok: true });
    }
    catch (e) {
        return res.status(400).json({ error: 'paystack_webhook_failed', details: e.message });
    }
});
exports.webhooksRouter.post('/stripe', express_1.default.raw({ type: 'application/json', limit: '1mb' }), async (req, res) => {
    try {
        const secret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!secret) {
            if (process.env.NODE_ENV === 'production') {
                return res.status(500).json({ error: 'missing_stripe_webhook_secret' });
            }
            console.warn('STRIPE_WEBHOOK_SECRET not set - webhook signature verification disabled (non-production)');
            const parsed = JSON.parse(req.body.toString('utf8'));
            req.body = parsed;
            await (0, stripe_2.handleStripeWebhook)(req, res);
            return res.json({ ok: true });
        }
        const sig = req.headers['stripe-signature'];
        if (!sig)
            return res.status(400).json({ error: 'missing_stripe_signature_header' });
        const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2022-11-15' });
        let evt;
        try {
            evt = stripe.webhooks.constructEvent(req.body, sig, secret);
        }
        catch (err) {
            return res.status(400).json({ error: 'invalid_stripe_signature', details: err.message });
        }
        ;
        req.body = evt;
        await (0, stripe_2.handleStripeWebhook)(req, res);
        return res.json({ ok: true });
    }
    catch (e) {
        return res.status(400).json({ error: 'stripe_webhook_failed', details: e.message });
    }
});
