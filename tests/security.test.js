import { test } from 'node:test'
import assert from 'node:assert/strict'
import { validatePublicFormRequest } from '../server/public-form-policy.js'
import changed from '../api/send-password-changed.js'
import reset from '../api/send-password-reset-confirmation.js'
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

test('la configuración de producción protege contenido y enlaces de descarga', async () => {
  const config = JSON.parse(await readFile('vercel.json', 'utf8'))
  const headers = Object.fromEntries(config.headers[0].headers.map(h => [h.key, h.value]))
  assert.equal(headers['X-Content-Type-Options'], 'nosniff')
  assert.equal(headers['Referrer-Policy'], 'no-referrer')
  assert.match(headers['Content-Security-Policy'], /script-src 'self';/)
  assert.match(headers['Content-Security-Policy'], /frame-ancestors 'none'/)
  assert.equal(config.functions['api/submit-kommo.js'].maxDuration, 60)
})
