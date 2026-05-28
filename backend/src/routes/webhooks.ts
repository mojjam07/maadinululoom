import { Router } from 'express'
import { handlePaystackWebhook } from '../services/payments/paystack'
import { handleStripeWebhook } from '../services/payments/stripe'

export const webhooksRouter = Router()

webhooksRouter.post('/paystack', async (req, res) => {
  try {
    await handlePaystackWebhook(req, res)
  } catch (e) {
    return res.status(400).json({ error: 'paystack_webhook_failed', details: (e as Error).message })
  }
})

webhooksRouter.post('/stripe', async (req, res) => {
  try {
    await handleStripeWebhook(req, res)
  } catch (e) {
    return res.status(400).json({ error: 'stripe_webhook_failed', details: (e as Error).message })
  }
})

