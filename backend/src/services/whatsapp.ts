export async function sendWhatsappBestEffort(_args: {
  userId: string
  classId: string
  offsetMins: number
  topic?: string
  startTimeISO: string
}) {
  // Provider not wired yet (e.g., Twilio WhatsApp).
  const whatsappProvider = process.env.WHATSAPP_PROVIDER
  const whatsappToken = process.env.WHATSAPP_TOKEN

  if (!whatsappProvider || !whatsappToken) return

  // eslint-disable-next-line no-console
  console.log('WhatsApp env configured, but WhatsApp sender is not implemented in this phase yet.')
}

