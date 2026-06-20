"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.escapeHtml = escapeHtml;
exports.sanitizeString = sanitizeString;
exports.sanitizeObject = sanitizeObject;
function escapeHtml(input) {
    return input
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}
function sanitizeString(input) {
    if (input === null || input === undefined)
        return null;
    const s = String(input);
    const t = s.trim();
    return t.length ? escapeHtml(t) : null;
}
function sanitizeObject(obj) {
    const out = {};
    for (const k of Object.keys(obj)) {
        const v = obj[k];
        if (typeof v === 'string')
            out[k] = escapeHtml(v.trim());
        else
            out[k] = v;
    }
    return out;
}
