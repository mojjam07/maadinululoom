import express from 'express'
import crypto from 'crypto'
import Stripe from 'stripe'
import { handlePaystackWebhook } from '../services/payments/paystack'
import { handleStripeWebhook } from '../services/payments/stripe'

export const webhooksRouter = express.Router()

// Use route-level raw parsing so we can verify signatures before parsing JSON
const RAW_OPTIONS = { limit: '1mb', type: '*/*' }

webhooksRouter.post('/paystack', express.raw(RAW_OPTIONS), async (req, res) => {
  try {
    const secret = process.env.PAYSTACK_WEBHOOK_SECRET
    const header = (req.headers['x-paystack-signature'] as string) || (req.headers['x-paystack-signature'] as string)

    if (!secret) {
      if (process.env.NODE_ENV === 'production') {
        return res.status(500).json({ error: 'missing_paystack_webhook_secret' })
      }
      console.warn('PAYSTACK_WEBHOOK_SECRET not set - webhook signature verification disabled (non-production)')
    } else {
      if (!header) return res.status(400).json({ error: 'missing_paystack_signature_header' })
      const expected = crypto.createHmac('sha512', secret).update(req.body).digest('hex')
      if (expected !== header) return res.status(400).json({ error: 'invalid_paystack_signature' })
    }

    const parsed = JSON.parse(req.body.toString('utf8'))
    ;(req as any).body = parsed

    await handlePaystackWebhook(req, res)
    return res.json({ ok: true })
  } catch (e) {
    return res.status(400).json({ error: 'paystack_webhook_failed', details: (e as Error).message })
  }
})

webhooksRouter.post('/stripe', express.raw({ type: 'application/json', limit: '1mb' }), async (req, res) => {
  try {
    const secret = process.env.STRIPE_WEBHOOK_SECRET

    if (!secret) {
      if (process.env.NODE_ENV === 'production') {
        return res.status(500).json({ error: 'missing_stripe_webhook_secret' })
      }
      console.warn('STRIPE_WEBHOOK_SECRET not set - webhook signature verification disabled (non-production)')
      const parsed = JSON.parse(req.body.toString('utf8'))
      ;(req as any).body = parsed
      await handleStripeWebhook(req, res)
      return res.json({ ok: true })
    }

    const sig = req.headers['stripe-signature'] as string | undefined
    if (!sig) return res.status(400).json({ error: 'missing_stripe_signature_header' })

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2022-11-15' })
    let evt: any
    try {
      evt = stripe.webhooks.constructEvent(req.body, sig, secret)
    } catch (err) {
      return res.status(400).json({ error: 'invalid_stripe_signature', details: (err as Error).message })
    }

    ;(req as any).body = evt
    await handleStripeWebhook(req, res)
    return res.json({ ok: true })
  } catch (e) {
    return res.status(400).json({ error: 'stripe_webhook_failed', details: (e as Error).message })
  }
})

