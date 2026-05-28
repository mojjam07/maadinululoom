import type express from 'express'
import { supabaseAdmin } from '../../supabaseAdmin'

// NOTE: Phase-5 scaffolding.
// Wire real Stripe signature verification with STRIPE_WEBHOOK_SECRET.

function getText(val: unknown): string | null {
  return typeof val === 'string' ? val : null
}

export async function handleStripeWebhook(req: express.Request, _res: express.Response) {
  const body = req.body as any

  // Typical Stripe webhook payload includes: type, data.object
  const eventType: string | null = getText(body?.type)
  const obj = body?.data?.object

  const paymentRef =
    getText(obj?.id) ||
    getText(obj?.payment_intent) ||
    getText(obj?.invoice) ||
    getText(obj?.payment_ref)

  const metadata = obj?.metadata || {}
  const studentId: string | null = getText(metadata?.student_id)

  if (!studentId) throw new Error('stripe_webhook_missing_student_id')
  if (!paymentRef) throw new Error('stripe_webhook_missing_reference')

  const ok = eventType?.includes('payment_succeeded') || eventType?.includes('invoice.paid')

  const amount = typeof obj?.amount_paid === 'number' ? obj.amount_paid / 100 : typeof obj?.amount === 'number' ? obj.amount / 100 : null
  const currency = getText(obj?.currency) || 'USD'

  await upsertPaymentAndSubscription({
    provider: 'stripe',
    providerRef: paymentRef,
    studentId,
    currency,
    amount,
    succeeded: !!ok,
  })
}

async function upsertPaymentAndSubscription(args: {
  provider: 'paystack' | 'stripe'
  providerRef: string
  studentId: string
  currency: string
  amount: number | null
  succeeded: boolean
}) {
  const { provider, providerRef, studentId, currency, amount, succeeded } = args

  const periodDays = 30 // $5/mo => treat as 30 days
  const now = new Date()
  const expiresAt = new Date(now.getTime() + periodDays * 24 * 60 * 60 * 1000)

  const paymentStatus = succeeded ? 'succeeded' : 'failed'

  const { data: existingPayment } = await supabaseAdmin
    .from('payments')
    .select('id')
    .eq('provider', provider)
    .eq('payment_ref', providerRef)
    .maybeSingle()

  if (!existingPayment) {
    await supabaseAdmin.from('payments').insert({
      student_id: studentId,
      amount: amount ?? null,
      currency,
      provider,
      status: paymentStatus,
      paid_at: succeeded ? now.toISOString() : null,
      payment_ref: providerRef,
      metadata: {
        raw: 'stripe',
      },
    })
  }

  const subStatus = succeeded ? 'active' : 'past_due'

  const { error: upErr } = await supabaseAdmin
    .from('subscriptions')
    .upsert({
      student_id: studentId,
      plan: 'INTL_5_MONTHLY',
      status: subStatus,
      expires_at: succeeded ? expiresAt.toISOString() : null,
      payment_ref: providerRef,
    })

  if (upErr) throw upErr
}

