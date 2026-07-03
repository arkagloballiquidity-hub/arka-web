// Shared CORS + request-size guard for ARKA's serverless endpoints.
//
// These endpoints are only ever called same-origin from the ARKA site, so we
// reflect the Origin header back only when it's on the allow-list (instead of
// the previous wildcard `*`). Unknown origins simply get no CORS header, which
// still lets same-origin requests through while blocking cross-origin abuse.
const ALLOWED_ORIGINS = [
  'https://www.arkaglobalinvestments.com',
  'https://arkaglobalinvestments.com',
]

export function applyCors(req, res) {
  const origin = req.headers.origin
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

// Rejects payloads whose JSON body is implausibly large for these forms,
// bounding the work a single request can trigger (email/PDF generation).
// Vercel already caps bodies at ~4.5MB; this is a tighter, form-specific limit.
export function bodyTooLarge(req, maxBytes = 64 * 1024) {
  const len = Number(req.headers['content-length'])
  return Number.isFinite(len) && len > maxBytes
}
