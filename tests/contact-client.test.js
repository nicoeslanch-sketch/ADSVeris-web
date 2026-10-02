import { test } from 'node:test'
import assert from 'node:assert/strict'
import { submitContactForm } from '../shared/submit-contact-form.js'

const reply = data => async () => ({ ok: true, json: async () => data })
test('una respuesta genérica no anuncia una descarga inexistente', async () => {
  await assert.rejects(submitContactForm({ downloadSlug: 'balance-general' }, { fetchImpl: reply({ success: true }) }), /confirmar la descarga/)
  await assert.rejects(submitContactForm({}, { fetchImpl: reply(null) }), /confirmar la recepción/)
  await assert.rejects(submitContactForm({}, { fetchImpl: reply({ success: 'true' }) }), /confirmar la recepción/)
})

test('solo presenta enlaces firmados relativos; un caso pendiente no invita a reenviar', async () => {
  const result = await submitContactForm({ downloadSlug: 'balance-general' }, {
    fetchImpl: reply({ success: true, downloadUrl: '/api/download-planilla?ticket=abc.def' }),
  })
  assert.equal(result.downloadUrl, '/api/download-planilla?ticket=abc.def')
  for (const url of ['https://evil.example/file', '/api/download-planilla?ticket=abc&other=1', 'javascript:alert(1)']) {
    await assert.rejects(submitContactForm({ downloadSlug: 'balance-general' }, { fetchImpl: reply({ success: true, downloadUrl: url }) }), /confirmar la descarga/)
  }
  const pending = await submitContactForm({ downloadSlug: 'balance-general' }, { fetchImpl: reply({ success: true, pending: true }) })
  assert.equal(pending.downloadUrl, '')
  assert.match(pending.message, /no necesitas enviarla de nuevo/)
})

test('la espera es limitada y jamás se reintenta automáticamente', async () => {
  let calls = 0
  const fetchImpl = async (url, { signal }) => {
    calls++
    return new Promise((resolve, reject) => signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true }))
  }
  await assert.rejects(submitContactForm({}, { fetchImpl, timeoutMs: 5 }), /evitar duplicados/)
  assert.equal(calls, 1)
  await assert.rejects(submitContactForm({}, { fetchImpl: async () => { throw new TypeError('Failed to fetch') } }), /No reenvíes inmediatamente/)
})

test('conserva el error del servidor sin declarar éxito ni envío de email', async () => {
  await assert.rejects(submitContactForm({}, {
    fetchImpl: async () => ({ ok: false, json: async () => ({ success: false, error: 'Registro no disponible.' }) }),
  }), /Registro no disponible/)
  const result = await submitContactForm({}, { fetchImpl: reply({ success: true }) })
  assert.match(result.message, /Registramos tu solicitud/)
  assert.doesNotMatch(result.message, /correo enviado/i)
})
