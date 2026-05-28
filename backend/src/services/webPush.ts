import { supabaseAdmin } from '../supabaseAdmin'

export async function sendWebPushBestEffort(_args: {
  userId: string
  classId: string
  offsetMins: number
  topic?: string
  startTimeISO: string
}) {
  // No push_subscriptions table is present in current schema.
  // We'll guard by env vars and log, but do nothing if not configured.

  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY

  if (!vapidPublicKey || !vapidPrivateKey) {
    return
  }

  // Future: store subscriptions in a table and send with web-push.
  // For now: best-effort no-op with log.
  // eslint-disable-next-line no-console
  console.log('web-push configured, but push sending is not implemented yet (no subscription storage).')

  // Optionally could look up subscriptions here when schema is added.
  await supabaseAdmin.from('notifications').select('id').limit(0)
}

