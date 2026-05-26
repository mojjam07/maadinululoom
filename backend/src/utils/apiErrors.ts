export function badRequest(message: string) {
  return { status: 400 as const, body: { error: message } }
}

export function unauthorized(message = 'unauthorized') {
  return { status: 401 as const, body: { error: message } }
}

export function notFound(message = 'not_found') {
  return { status: 404 as const, body: { error: message } }
}

export function internal(message = 'internal_error') {
  return { status: 500 as const, body: { error: message } }
}
