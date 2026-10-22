import { test } from 'node:test'
import assert from 'node:assert/strict'
import { validatePublicFormRequest } from '../server/public-form-policy.js'
import changed from '../api/send-password-changed.js'
import reset from '../api/send-password-reset-confirmation.js'
import legacyKommoWebhook from '../api/kommo-contactados-webhook.js'
import { readFile } from 'node:fs/promises'

const request = { headers: { origin: 'https://pymex-web.vercel.app', 'content-type': 'application/json' }, body: { details: 'Consulta' } }
test('el formulario restringe origen, formato y tamaño antes de usar el CRM', () => {
  assert.equal(validatePublicFormRequest(request), null)
  for (const origin of [undefined, 'null', 'https://evil.example', 'https://pymex-web.vercel.app.evil.example']) {
    assert.equal(validatePublicFormRequest({ ...request, headers: { ...request.headers, origin } }).status, 403)
  }
  assert.equal(validatePublicFormRequest({ ...request, headers: { ...request.headers, 'sec-fetch-site': 'cross-site' } }).status, 403)
  assert.equal(validatePublicFormRequest({ ...request, headers: { ...request.headers, 'content-type': 'text/plain' } }).status, 415)
  assert.equal(validatePublicFormRequest({ ...request, body: { details: 'x'.repeat(21000) } }).status, 413)
  assert.equal(validatePublicFormRequest({ ...request, headers: { ...request.headers, 'content-length': '99999' } }).status, 413)
})

test('las notificaciones antiguas no admiten envío de correos arbitrarios', async () => {
  for (const handler of [changed, reset]) {
    const res = { setHeader() {}, status(code) { this.code = code; return this }, json(body) { this.body = body; return this } }
    await handler({ method: 'POST', body: { userEmail: 'attacker@example.com', userName: '<script>test</script>' } }, res)
    assert.equal(res.code, 404)
    assert.deepEqual(res.body, { error: 'Servicio no disponible.' })
  }
})

test('el webhook antiguo sigue sin enviar correos y no accede al parser de query obsoleto', async () => {
  const previousSecret = process.env.KOMMO_WEBHOOK_SECRET
  process.env.KOMMO_WEBHOOK_SECRET = 'test-only-secret'
  try {
    for (const [url, expected] of [
      ['/api/kommo-contactados-webhook?secret=test-only-secret', 200],
      ['/api/kommo-contactados-webhook', 401],
      ['/api/kommo-contactados-webhook?secret=wrong', 401],
      ['/api/kommo-contactados-webhook?secret=test-only-secret&secret=test-only-secret', 401],
      ['http://[', 401],
    ]) {
      const req = { method: 'POST', url, get query() { throw new Error('No usar req.query') } }
      const res = { status(code) { this.code = code; return this }, json(body) { this.body = body; return this } }
      await legacyKommoWebhook(req, res)
      assert.equal(res.code, expected)
      if (expected === 200) assert.equal(res.body.disabled, true)
    }
  } finally {
    if (previousSecret === undefined) delete process.env.KOMMO_WEBHOOK_SECRET
    else process.env.KOMMO_WEBHOOK_SECRET = previousSecret
  }
})

test('la configuración de producción protege contenido y enlaces de descarga', async () => {
  const config = JSON.parse(await readFile('vercel.json', 'utf8'))
  const headers = Object.fromEntries(config.headers[0].headers.map(h => [h.key, h.value]))
  assert.equal(headers['X-Content-Type-Options'], 'nosniff')
  assert.equal(headers['Referrer-Policy'], 'no-referrer')
  assert.match(headers['Content-Security-Policy'], /script-src 'self';/)
  assert.match(headers['Content-Security-Policy'], /frame-ancestors 'none'/)
  assert.equal(config.functions['api/submit-kommo.js'].maxDuration, 60)
})
