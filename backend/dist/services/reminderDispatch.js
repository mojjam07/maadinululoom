"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendClassReminderBestEffort = sendClassReminderBestEffort;
const webPush_js_1 = require("./webPush.js");
const email_js_1 = require("./email.js");
const whatsapp_js_1 = require("./whatsapp.js");
async function sendClassReminderBestEffort(args) {
    // Best-effort: never throw.
    try {
        await Promise.all([
            (0, webPush_js_1.sendWebPushBestEffort)(args),
            (0, email_js_1.sendEmailBestEffort)(args),
            (0, whatsapp_js_1.sendWhatsappBestEffort)(args),
        ]);
    }
    catch (e) {
        // eslint-disable-next-line no-console
        console.error('sendClassReminderBestEffort failed', e);
    }
}
