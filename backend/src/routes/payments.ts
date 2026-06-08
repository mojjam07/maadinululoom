import { Router, Request, Response } from 'express'
import { supabaseAdmin } from '../supabaseAdmin'
import { requireAuth } from '../middleware/requireAuth'
import crypto from 'crypto'

export const paymentsRouter = Router()

// POST /api/payments/create
// Creates a payments record with status 'pending' and returns a provider initialization
async function handleCreate(req: Request, res: Response) {
  const {
    provider,
    amount,
    currency,
    student_id,
    metadata,
  } = req.body as {
    provider?: string
    amount?: number
    currency?: string
    student_id?: string
    metadata?: any
  }

  const prov = typeof provider === 'string' ? provider.toLowerCase() : null
  if (!prov || (prov !== 'stripe' && prov !== 'paystack')) return res.status(400).json({ error: 'invalid_provider' })
  if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) return res.status(400).json({ error: 'invalid_amount' })
  const paymentRef = `init_${Date.now()}_${Math.floor(Math.random() * 100000)}`
  const cur = typeof currency === 'string' ? currency.toUpperCase() : prov === 'paystack' ? 'NGN' : 'USD'

  const payload = {
    id: crypto.randomUUID(),
    student_id: student_id || null,
    amount,
    currency: cur,
    provider: prov,
    // Schema enforces status in ('succeeded','failed') — use 'failed' for initial record
    status: 'failed',
    paid_at: null,
    payment_ref: paymentRef,
    metadata: Object.assign({ initialized_at: new Date().toISOString() }, metadata || {}),
  }

  let insertErr = null
  if (student_id && typeof student_id === 'string') {
    const { error } = await supabaseAdmin.from('payments').insert(payload)
    insertErr = error
  }

  if (insertErr) return res.status(400).json({ error: 'payment_insert_failed', details: insertErr.message })

  // Provider initialization stub: real integration should call provider SDKs.
  const init = prov === 'stripe'
    ? { client_secret: `test_client_secret_${paymentRef}` }
    : { authorization_url: `https://paystack.com/pay/${paymentRef}` }

  return res.json({ ok: true, provider: prov, payment_ref: paymentRef, init })
}

paymentsRouter.post('/create', handleCreate)

// Optional: create payment for authenticated student (dashboard)
paymentsRouter.post('/create/me', requireAuth, async (req, res) => {
  const studentId = (req as any).auth.userId as string
  const body = Object.assign({}, req.body || {}, { student_id: studentId })
  req.body = body
  return handleCreate(req, res)
})
