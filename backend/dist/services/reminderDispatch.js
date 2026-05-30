import { sendWebPushBestEffort } from './webPush.js';
import { sendEmailBestEffort } from './email.js';
import { sendWhatsappBestEffort } from './whatsapp.js';
export async function sendClassReminderBestEffort(args) {
    // Best-effort: never throw.
    try {
        await Promise.all([
            sendWebPushBestEffort(args),
            sendEmailBestEffort(args),
            sendWhatsappBestEffort(args),
        ]);
    }
    catch (e) {
        // eslint-disable-next-line no-console
        console.error('sendClassReminderBestEffort failed', e);
    }
}
