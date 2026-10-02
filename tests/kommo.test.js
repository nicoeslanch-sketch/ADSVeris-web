import { test, afterEach, beforeEach, mock } from 'node:test'
import assert from 'node:assert/strict'
import handler, { ROUTES } from '../api/submit-kommo.js'
import { CONTACT_SERVICES, findContactService } from '../shared/contact-services.js'

const originalFetch = global.fetch
const envBefore = { ...process.env }
beforeEach(() => { mock.method(Date, 'now', () => Date.parse('2026-10-02T12:00:00Z')) })
afterEach(() => { global.fetch = originalFetch; process.env = { ...envBefore }; mock.restoreAll() })
const valid = { name: 'Prueba', email: 'prueba@example.com', phone: '+56 9 1234 5678', serviceType: 'Página Web', details: 'Error 500', privacyConsent: true }

async function submit(body = valid, method = 'POST') {
  const res = {
    code: 200, headers: {}, setHeader(key, value) { this.headers[key] = value },
    status(code) { this.code = code; return this }, json(data) { this.data = data; return this },
  }
  await handler({ body, method, headers: { origin: 'https://pymex-web.vercel.app', 'content-type': 'application/json' } }, res)
  return res
}

function fakeKommo(service, failAt) {
  Object.assign(process.env, { KOMMO_API_TOKEN: 'test-only', KOMMO_SUBDOMAIN: 'test-account', KOMMO_ACCOUNT_ID: '123' })
  const calls = []
  const route = ROUTES[service.key]
  global.fetch = async (url, options) => {
    const payload = options.body ? JSON.parse(options.body) : undefined
    calls.push({ url, method: options.method, payload })
    if (calls.length === failAt) return { ok: false, status: 500, json: async () => ({ detail: 'private vendor payload' }) }
    let data = {}
    if (url.endsWith('/contacts')) data = { _embedded: { contacts: [{ id: 11 }] } }
    else if (url.endsWith('/leads') && options.method === 'POST') data = { _embedded: { leads: [{ id: 22 }] } }
    else if (options.method === 'GET') data = {
      id: 22, pipeline_id: route.pipeline, status_id: calls.length < 6 ? route.source : route.target,
      _embedded: { contacts: [{ id: 11, is_main: true }], tags: [{ id: route.tag }] },
    }
    return { ok: true, status: 200, json: async () => data }
  }
  return calls
}

test('todos los servicios, incluidos los cuatro planes WordPress, conservan su etiqueta y embudo', async () => {
  for (const service of CONTACT_SERVICES) {
    const calls = fakeKommo(service)
    const isDownload = service.label === 'Descarga de planilla gratuita'
    const res = await submit({ ...valid, serviceType: service.label, ...(isDownload ? { downloadSlug: 'balance-general', phone: '' } : {}) })
    assert.equal(res.code, 200)
    assert.equal(res.data.success, true)
    if (isDownload) assert.match(res.data.downloadUrl, /^\/api\/download-planilla\?ticket=/)
    else assert.deepEqual(res.data, { success: true })
    const lead = calls[1].payload[0]
    assert.equal(lead.pipeline_id, ROUTES[service.key].pipeline)
    assert.equal(lead.name, `${isDownload ? 'Balance General (gratis)' : service.label} - Prueba`)
    assert.deepEqual(lead._embedded.contacts, [{ id: 11, is_main: true }])
    assert.match(calls[2].payload[0].params.text, /Error 500/)
    assert.match(calls[2].payload[0].params.text, /Privacidad 2026-10-02/)
    assert.match(calls[2].payload[0].params.text, /NO autorizadas/)
    assert.equal(calls[3].method, 'GET') // recipient confirmed before trigger
    assert.equal(calls[4].method, 'PATCH')
    assert.equal(calls[4].payload.status_id, ROUTES[service.key].target)
    assert.equal(calls.length, 6)
  }
})

test('rechaza entradas inválidas sin contactar al CRM', async () => {
  global.fetch = () => { throw new Error('Must not call Kommo') }
  for (const body of [null, [], '{', { ...valid, privacyConsent: false }, { ...valid, email: 'invalido' },
    { ...valid, phone: 'abc' }, { ...valid, serviceType: 'inventado' }, { ...valid, details: 'x'.repeat(3001) },
    { ...valid, name: 'x'.repeat(101) }]) assert.equal((await submit(body)).code, 400)
  assert.equal((await submit(valid, 'GET')).code, 405)
})

test('campo opcional vacío y normalización de acentos', async () => {
  const calls = fakeKommo(findContactService('Pagina Web'))
  assert.equal((await submit(JSON.stringify({ ...valid, serviceType: 'Pagina Web', details: '' }))).code, 200)
  assert.match(calls[2].payload[0].params.text, /No informado/)
})

test('no activa el correo cuando falla el guardado de la nota', async () => {
  const calls = fakeKommo(findContactService(valid.serviceType), 3)
  const res = await submit()
  assert.equal(res.code, 202)
  assert.equal(res.data.pending, true)
  assert.equal(calls.length, 3)
  assert.ok(!JSON.stringify(res.data).includes('private'))
})

test('no entrega una descarga si no se pudo registrar la autorización', async () => {
  fakeKommo(findContactService('Descarga de planilla gratuita'), 3)
  const res = await submit({ ...valid, serviceType: 'Descarga de planilla gratuita', phone: '', downloadSlug: 'balance-general' })
  assert.equal(res.code, 202)
  assert.equal(res.data.pending, true)
  assert.equal(res.data.downloadUrl, undefined)
})

test('error previo al lead no publica payloads privados ni anuncia éxito', async () => {
  fakeKommo(findContactService(valid.serviceType), 1)
  const res = await submit()
  assert.equal(res.code, 502)
  assert.equal(res.data.success, false)
  assert.ok(!JSON.stringify(res.data).includes('private'))
})

test('honeypot no crea contactos ni dispara correos', async () => {
  global.fetch = () => { throw new Error('Must not call Kommo') }
  const res = await submit({ ...valid, website: 'bot.example' })
  assert.equal(res.code, 400)
  assert.equal(res.data.success, false)
})

test('la oferta termina realmente y no crea solicitudes gratuitas fuera de plazo', async () => {
  mock.method(Date, 'now', () => Date.parse('2026-10-16T03:00:00Z'))
  global.fetch = () => { throw new Error('Must not call Kommo') }
  const res = await submit({ ...valid, serviceType: 'Descarga de planilla gratuita', phone: '', downloadSlug: 'balance-general' })
  assert.equal(res.code, 410)
  assert.equal(res.data.downloadUrl, undefined)
})

test('restricción real de Kommo no anuncia éxito ni habilita descarga sin registro', async () => {
  fakeKommo(findContactService('Descarga de planilla gratuita'))
  let calls = 0
  global.fetch = async () => {
    calls++
    return { ok: false, status: 400, headers: new Headers({ 'content-type': 'application/problem+json' }),
      json: async () => ({ title: 'Bad Request', detail: 'Error code 205. Contact not created.' }) }
  }
  const res = await submit({ ...valid, serviceType: 'Descarga de planilla gratuita', phone: '', downloadSlug: 'balance-general' })
  assert.equal(res.code, 503)
  assert.equal(res.data.success, false)
  assert.equal(res.data.downloadUrl, undefined)
  assert.match(res.data.error, /servicios@adsveris.com/)
  assert.equal(calls, 1)
})

test('descargas requieren planilla válida y consentimiento separado; teléfono no obligatorio', async () => {
  const calls = fakeKommo(findContactService('Descarga de planilla gratuita'))
  const res = await submit({ ...valid, serviceType: 'Descarga de planilla gratuita', phone: '', downloadSlug: 'balance-general', marketingConsent: true })
  assert.equal(res.code, 200)
  assert.match(calls[2].payload[0].params.text, /AUTORIZADAS expresamente/)
  assert.equal(calls[0].payload[0].custom_fields_values.length, 1)
  assert.equal((await submit({ ...valid, serviceType: 'Descarga de planilla gratuita', downloadSlug: '../../secret' })).code, 400)
})

test('respeta la saturación del proveedor sin repetir el POST ni exponer detalles', async () => {
  fakeKommo(findContactService(valid.serviceType))
  let calls = 0
  global.fetch = async () => {
    calls++
    return { ok: false, status: 429, headers: new Headers({ 'retry-after': '12' }),
      json: async () => ({ detail: 'private vendor payload', 'validation-errors': { malformed: true } }) }
  }
  const res = await submit()
  assert.equal(res.code, 429)
  assert.equal(res.headers['Retry-After'], '12')
  assert.equal(res.data.success, false)
  assert.equal(calls, 1)
  assert.ok(!JSON.stringify(res.data).includes('private'))
})

test('un timeout puede haber creado el contacto: no invita a duplicar la solicitud', async () => {
  fakeKommo(findContactService(valid.serviceType))
  global.fetch = async () => { throw new DOMException('vendor secret', 'TimeoutError') }
  const res = await submit()
  assert.equal(res.code, 502)
  assert.equal(res.data.success, false)
  assert.match(res.data.error, /No reenvíes inmediatamente/)
  assert.ok(!JSON.stringify(res.data).includes('vendor secret'))
})

test('respuestas malformadas no disparan correo ni autorizan descarga', async () => {
  for (const payload of [null, { 'validation-errors': [null, { errors: [null] }] }]) {
    fakeKommo(findContactService(valid.serviceType))
    global.fetch = async () => ({ ok: false, status: 400, json: async () => payload })
    const res = await submit()
    assert.equal(res.code, 502)
    assert.equal(res.data.success, false)
  }
  fakeKommo(findContactService(valid.serviceType))
  global.fetch = async () => ({ ok: true, status: 200, json: async () => ({ _embedded: { contacts: [{ id: -1 }] } }) })
  assert.equal((await submit()).code, 502)
})
