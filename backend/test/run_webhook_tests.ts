import { handlePaystackWebhook } from '../src/services/payments/paystack'
import { handleStripeWebhook } from '../src/services/payments/stripe'

async function run() {
  let failed = 0

  // Paystack: missing student_id should throw
  try {
    const req: any = { body: { event: 'charge.success', data: { reference: 'ref_1', amount: 500000, status: 'success', metadata: {} } } }
    const res: any = {}
    await handlePaystackWebhook(req, res)
    console.error('Paystack test expected to throw for missing student_id')
    failed++
  } catch (e) {
    console.log('Paystack missing-student test passed')
  }

  // Stripe: missing student_id should throw
  try {
    const req: any = { body: { type: 'payment_intent.succeeded', data: { object: { id: 'pi_1', amount_paid: 50000, currency: 'usd', metadata: {} } } } }
    const res: any = {}
    await handleStripeWebhook(req, res)
    console.error('Stripe test expected to throw for missing student_id')
    failed++
  } catch (e) {
    console.log('Stripe missing-student test passed')
  }

  if (failed > 0) {
    console.error(`${failed} webhook tests failed`)
    process.exit(1)
  }

  console.log('Webhook smoke tests completed')
}

run().catch((err) => {
  console.error('Webhook tests crashed:', err)
  process.exit(2)
})
