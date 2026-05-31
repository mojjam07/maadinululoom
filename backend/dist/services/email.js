"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmailBestEffort = sendEmailBestEffort;
async function sendEmailBestEffort(_args) {
    // SMTP/Twilio not wired in this repo yet.
    // Guard by env vars and do best-effort no-op.
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    if (!smtpHost || !smtpUser || !smtpPass)
        return;
    // eslint-disable-next-line no-console
    console.log('Email env configured, but email sender is not implemented in this phase yet.');
}
