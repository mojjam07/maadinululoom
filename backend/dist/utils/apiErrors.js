"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.badRequest = badRequest;
exports.unauthorized = unauthorized;
exports.notFound = notFound;
exports.internal = internal;
function badRequest(message) {
    return { status: 400, body: { error: message } };
}
function unauthorized(message = 'unauthorized') {
    return { status: 401, body: { error: message } };
}
function notFound(message = 'not_found') {
    return { status: 404, body: { error: message } };
}
function internal(message = 'internal_error') {
    return { status: 500, body: { error: message } };
}
