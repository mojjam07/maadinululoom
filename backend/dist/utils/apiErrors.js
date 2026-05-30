export function badRequest(message) {
    return { status: 400, body: { error: message } };
}
export function unauthorized(message = 'unauthorized') {
    return { status: 401, body: { error: message } };
}
export function notFound(message = 'not_found') {
    return { status: 404, body: { error: message } };
}
export function internal(message = 'internal_error') {
    return { status: 500, body: { error: message } };
}
