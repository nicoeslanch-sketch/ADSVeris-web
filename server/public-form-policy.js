const MAX_BODY_BYTES = 20 * 1024

// Origin checks stop cross-site browser submissions, not scripted spam.
export function validatePublicFormRequest(req) {
  const origin = req.headers?.origin
  const allowed = new Set(['https://pymex-web.vercel.app'])
  for (const host of [process.env.VERCEL_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL]) {
    if (host) allowed.add(`https://${host}`)
  }
  if (process.env.NODE_ENV !== 'production' && typeof origin === 'string' && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) allowed.add(origin)
  if (!allowed.has(origin) || req.headers?.['sec-fetch-site'] === 'cross-site') {
    return { status: 403, error: 'Envía tu solicitud desde el formulario de ADS Veris.' }
  }
  if (!/^application\/json(?:\s*;|$)/i.test(req.headers?.['content-type'] || '')) {
    return { status: 415, error: 'Formato de solicitud no permitido.' }
  }
  const declaredLength = Number(req.headers?.['content-length'])
  const bodyLength = Buffer.byteLength(typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? null), 'utf8')
  if (declaredLength > MAX_BODY_BYTES || bodyLength > MAX_BODY_BYTES) {
    return { status: 413, error: 'La solicitud es demasiado extensa.' }
  }
  return null
}
