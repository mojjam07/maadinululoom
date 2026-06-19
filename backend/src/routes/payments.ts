import { Router, Request, Response } from 'express'
import { supabaseAdmin } from '../supabaseAdmin'
import { requireAuth } from '../middleware/requireAuth'
import crypto from 'crypto'
import { z } from 'zod'
import { validateBody } from '../middleware/validate'

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

  // Validate student exists if provided
  if (student_id) {
    if (typeof student_id !== 'string' || student_id.trim().length === 0) return res.status(400).json({ error: 'invalid_student_id' })
    const { data: profile, error: profErr } = await supabaseAdmin.from('profiles').select('id').eq('id', student_id).maybeSingle()
    if (profErr) return res.status(500).json({ error: 'profile_lookup_failed', details: profErr.message })
    if (!profile) return res.status(400).json({ error: 'student_not_found' })

    const { error } = await supabaseAdmin.from('payments').insert(payload)
    if (error) return res.status(400).json({ error: 'payment_insert_failed', details: error.message })
  }

  // Provider initialization stub: real integration should call provider SDKs.
  const init = prov === 'stripe'
    ? { client_secret: `test_client_secret_${paymentRef}` }
    : { authorization_url: `https://paystack.com/pay/${paymentRef}` }

  return res.json({ ok: true, provider: prov, payment_ref: paymentRef, init })
}

const CreatePaymentSchema = z.object({
  provider: z.enum(['stripe', 'paystack']),
  amount: z.number().positive(),
  currency: z.string().min(3).max(4).optional(),
  student_id: z.string().uuid().optional().nullable(),
  metadata: z.any().optional(),
})

paymentsRouter.post('/create', validateBody(CreatePaymentSchema), handleCreate)

// Optional: create payment for authenticated student (dashboard)
paymentsRouter.post('/create/me', requireAuth, async (req, res) => {
  const studentId = (req as any).auth.userId as string
  const body = Object.assign({}, req.body || {}, { student_id: studentId })
  req.body = body
  return handleCreate(req, res)
})
