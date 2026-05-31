"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePaystackWebhook = handlePaystackWebhook;
const supabaseAdmin_1 = require("../../supabaseAdmin");
// NOTE: This is Phase-5 scaffolding.
// It will compile, and webhook will persist payment/subscription updates.
// Signature verification and provider-specific fields need to be wired with real Paystack secrets.
function getText(val) {
    return typeof val === 'string' ? val : null;
}
function getNumber(val) {
    return typeof val === 'number' ? val : null;
}
async function handlePaystackWebhook(req, _res) {
    // Paystack typical body: { event, data: { ... } }
    const body = req.body;
    const eventType = getText(body?.event);
    const data = body?.data;
    const paymentStatus = getText(data?.status); // "success" | ...
    const amountNaira = getNumber(data?.amount); // typically in kobo
    const reference = getText(data?.reference) || getText(data?.metadata?.payment_ref) || getText(data?.metadata?.subscription_ref);
    // We rely on metadata.payment_ref to map to student.
    const studentId = getText(data?.metadata?.student_id) || getText(data?.metadata?.customer_id);
    if (!studentId)
        throw new Error('paystack_webhook_missing_student_id');
    if (!reference)
        throw new Error('paystack_webhook_missing_reference');
    const currency = 'NGN';
    const amount = amountNaira !== null ? amountNaira / 100 : null;
    const ok = eventType?.toLowerCase().includes('success') || paymentStatus === 'success';
    await upsertPaymentAndSubscription({
        provider: 'paystack',
        providerRef: reference,
        studentId,
        currency,
        amount,
        succeeded: ok,
    });
}
async function upsertPaymentAndSubscription(args) {
    const { provider, providerRef, studentId, currency, amount, succeeded } = args;
    const periodDays = 30; // ₦5,000/mo => treat as 30 days
    const now = new Date();
    const expiresAt = new Date(now.getTime() + periodDays * 24 * 60 * 60 * 1000);
    // Idempotency: upsert payment by payment_ref via subscriptions.payment_ref.
    // payments has id, so we also store provider+payment_ref.
    const { data: existingPayment } = await supabaseAdmin_1.supabaseAdmin
        .from('payments')
        .select('id')
        .eq('provider', provider)
        .eq('payment_ref', providerRef)
        .maybeSingle();
    const paymentStatus = succeeded ? 'succeeded' : 'failed';
    if (!existingPayment) {
        await supabaseAdmin_1.supabaseAdmin.from('payments').insert({
            student_id: studentId,
            amount: amount ?? null,
            currency,
            provider,
            status: paymentStatus,
            paid_at: succeeded ? now.toISOString() : null,
            payment_ref: providerRef,
            metadata: {
                raw: 'paystack',
            },
        });
    }
    // Upsert subscription: always create/update on webhook.
    const subStatus = succeeded ? 'active' : 'past_due';
    const { error: upErr } = await supabaseAdmin_1.supabaseAdmin
        .from('subscriptions')
        .upsert({
        student_id: studentId,
        plan: 'NGN_5000_MONTHLY',
        status: subStatus,
        expires_at: succeeded ? expiresAt.toISOString() : null,
        payment_ref: providerRef,
    });
    if (upErr)
        throw upErr;
}
