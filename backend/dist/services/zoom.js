"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMeeting = createMeeting;
const config_1 = require("../config");
function getEnv(name) {
    const v = process.env[name];
    if (!v)
        throw new Error(`Missing env var: ${name}`);
    return v;
}
/**
 * Zoom integration placeholder.
 *
 * This project currently does not include Zoom OAuth credentials.
 * To keep the backend progressing, we expose a clean interface and fail
 * with a clear error if required env vars are absent.
 */
async function createMeeting(input) {
    // Required env vars for a real implementation (server-to-server OAuth / JWT).
    // We validate them early so misconfiguration is obvious.
    //
    // Notes:
    // - If your setup differs, adjust accordingly.
    // - We'll keep these optional at runtime if not available.
    const clientId = process.env.ZOOM_CLIENT_ID;
    const clientSecret = process.env.ZOOM_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
        throw new Error('ZOOM_NOT_CONFIGURED: set ZOOM_CLIENT_ID and ZOOM_CLIENT_SECRET');
    }
    // TODO: Implement actual Zoom OAuth + meeting creation.
    // For now, we return deterministic placeholders so the rest of the flow can be wired.
    // Replace with real Zoom API calls when credentials are configured.
    const fakeMeetingId = `pending_${Buffer.from(input.topic).toString('base64').slice(0, 10)}`;
    const joinUrl = `https://zoom.us/j/${encodeURIComponent(fakeMeetingId)}`;
    // Prevent unused lint warnings
    void config_1.config;
    return {
        zoom_meeting_id: fakeMeetingId,
        zoom_join_url: joinUrl,
    };
}
