"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhooksRouter = void 0;
const express_1 = require("express");
const paystack_1 = require("../services/payments/paystack");
const stripe_1 = require("../services/payments/stripe");
exports.webhooksRouter = (0, express_1.Router)();
exports.webhooksRouter.post('/paystack', async (req, res) => {
    try {
        await (0, paystack_1.handlePaystackWebhook)(req, res);
    }
    catch (e) {
        return res.status(400).json({ error: 'paystack_webhook_failed', details: e.message });
    }
});
exports.webhooksRouter.post('/stripe', async (req, res) => {
    try {
        await (0, stripe_1.handleStripeWebhook)(req, res);
    }
    catch (e) {
        return res.status(400).json({ error: 'stripe_webhook_failed', details: e.message });
    }
});
