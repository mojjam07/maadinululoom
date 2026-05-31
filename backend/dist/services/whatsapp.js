"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWhatsappBestEffort = sendWhatsappBestEffort;
async function sendWhatsappBestEffort(_args) {
    // Provider not wired yet (e.g., Twilio WhatsApp).
    const whatsappProvider = process.env.WHATSAPP_PROVIDER;
    const whatsappToken = process.env.WHATSAPP_TOKEN;
    if (!whatsappProvider || !whatsappToken)
        return;
    // eslint-disable-next-line no-console
    console.log('WhatsApp env configured, but WhatsApp sender is not implemented in this phase yet.');
}
