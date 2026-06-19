export function escapeHtml(input: string) {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

export function sanitizeString(input: unknown): string | null {
  if (input === null || input === undefined) return null
  const s = String(input)
  const t = s.trim()
  return t.length ? escapeHtml(t) : null
}

export function sanitizeObject(obj: Record<string, unknown>) {
  const out: Record<string, unknown> = {}
  for (const k of Object.keys(obj)) {
    const v = obj[k]
    if (typeof v === 'string') out[k] = escapeHtml(v.trim())
    else out[k] = v
  }
  return out
}
