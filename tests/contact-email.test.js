import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { buildContactEmail, CONTACT_EMAIL_TEMPLATES, sendContactEmail, checkResendConfiguration } from '../server/contact-email.js'

const context = { serviceKey: 'web', serviceLabel: 'Reparación urgente WordPress', name: 'Nicolás <img src=x onerror=alert(1)>', email: 'test@example.com', leadId: 123 }
const approved = { CONTACT_EMAIL_MODE: 'test', CONTACT_EMAIL_BUDGET_APPROVED: 'true', CONTACT_EMAIL_TEST_TO: 'test@example.com',
  CONTACT_EMAIL_SENDER_VERIFIED: 'true', CONTACT_EMAIL_TRACKING_DISABLED: 'true', RESEND_API_KEY: 'test-only' }
const providerId = '49a3999c-0ce1-4ea6-ab68-afcd6dc2e794'

test('los tres adjuntos son exactamente los PDFs originales, con un mensaje específico por servicio', () => {
  for (const [serviceKey, template] of Object.entries(CONTACT_EMAIL_TEMPLATES)) {
    const mail = buildContactEmail({ ...context, serviceKey })
    assert.equal(mail.subject, template.subject)
    assert.deepEqual(mail.to, [context.email])
    assert.equal(mail.reply_to, 'servicios@adsveris.com')
    assert.equal(mail.from, 'ADS Veris <servicios@adsveris.com>')
    assert.match(mail.text, /Hola Nicolás/)
    const html = mail.html
    assert.match(html, /<table role="presentation"/)
    assert.match(html, /https:\/\/wa.me\/56983894129/)
    assert.match(html, /Nicolás &lt;img/)
    assert.doesNotMatch(html, /<img src=x|\{\{contact.name\}\}/)
    assert.match(html, /no te suscribe a publicidad/)
    assert.equal(mail.tracking_settings, undefined)
    assert.equal(mail.personalizations, undefined)
    assert.deepEqual(mail.tags, [{ name: 'service', value: serviceKey }, { name: 'source', value: 'contact-form' }])
    assert.equal(mail.cc, undefined)
    assert.equal(mail.bcc, undefined)
    if (template.pdf) {
      assert.equal(mail.attachments.length, 1)
      assert.equal(mail.attachments[0].filename, template.pdf)
      const data = Buffer.from(mail.attachments[0].content, 'base64')
      assert.deepEqual(data, readFileSync(`pdfs/${template.pdf}`))
      assert.equal(createHash('sha256').update(data).digest('hex'), template.sha256)
      assert.match(html, /no constituyen una oferta vigente/)
    } else {
      assert.equal(mail.attachments, undefined)
      assert.match(html, /en desarrollo/)
      assert.doesNotMatch(html, /Adjuntamos el folleto/)
    }
  }
})

test('rechaza servicio, destinatario y remitente inyectados o PDF modificado, sin envíos', () => {
  for (const invalid of [{ serviceKey: '../secret' }, { serviceKey: 'toString' }, { email: 'test@example.com\r\nBcc:other@example.com' },
    { email: 'test@example.com,other@example.com' }, { email: 'Name<test@example.com>' }, { leadId: 0 }]) {
    assert.throws(() => buildContactEmail({ ...context, ...invalid }), /Invalid email context/)
  }
  assert.throws(() => buildContactEmail(context, { from: 'attacker@example.com' }), /Invalid email context/)
  assert.throws(() => buildContactEmail(context, { readPdf: () => Buffer.from('%PDF-changed') }), /PDF missing or changed/)
})

test('sin aprobación de costos o destinatario permitido no se contacta al proveedor', async () => {
  const fetchImpl = () => { throw new Error('Must not call Resend') }
  assert.equal((await sendContactEmail(context, { env: {}, fetchImpl })).status, 'disabled')
  assert.equal((await sendContactEmail(context, { env: { CONTACT_EMAIL_MODE: 'live' }, fetchImpl })).status, 'budget_unverified')
  assert.equal((await sendContactEmail(context, { env: { ...approved, CONTACT_EMAIL_TEST_TO: '' }, fetchImpl })).status, 'test_recipient_blocked')
  for (const flag of ['CONTACT_EMAIL_SENDER_VERIFIED', 'CONTACT_EMAIL_TRACKING_DISABLED']) {
    assert.equal((await sendContactEmail(context, { env: { ...approved, [flag]: 'false' }, fetchImpl })).status, 'sender_unverified')
  }
  assert.equal((await sendContactEmail(context, { env: { ...approved, RESEND_API_KEY: '', SENDGRID_API_KEY: 'legacy-only' }, fetchImpl })).status, 'missing_key')
})

test('diagnóstico es local: no exige acceso completo ni afirma validar credencial o cuota', async () => {
  const result = checkResendConfiguration({ env: approved })
  assert.deepEqual(result, { status: 'configuration_checked', provider: 'resend', keyConfigured: true, budgetApproved: true, senderVerified: true, trackingDisabled: true })
  assert.doesNotMatch(JSON.stringify(result), /test-only|accountType|accountHttp/)
  const checked = await sendContactEmail(context, { env: { ...approved, CONTACT_EMAIL_MODE: 'check' }, fetchImpl: () => { throw new Error('No network') } })
  assert.equal(checked.pdfReady, true)
  assert.equal(checked.pdfCount, 1)
  assert.equal(checked.keyConfigured, true)
})

test('envío usa solo el destinatario validado, adjunta PDF y diferencia aceptación de entrega', async () => {
  let calls = 0
  const result = await sendContactEmail(context, { env: approved, fetchImpl: async (url, options) => {
    calls++
    assert.equal(url, 'https://api.resend.com/emails')
    assert.equal(options.method, 'POST')
    const body = JSON.parse(options.body)
    assert.equal(body.attachments[0].filename, 'ADS_Veris_Paginas_Web.pdf')
    assert.deepEqual(body.to, [context.email])
    assert.equal(body.bcc, undefined)
    assert.equal(options.headers['Idempotency-Key'], 'adsveris-contact-v2/123')
    assert.equal(options.headers.Authorization, 'Bearer test-only')
    return { status: 200, json: async () => ({ id: providerId }) }
  } })
  assert.deepEqual(result, { status: 'accepted', providerId })
  assert.equal(calls, 1)
})

test('error, cuota y timeout no producen reintentos ni afirmaciones de correo entregado', async () => {
  for (const http of [400, 401, 403, 409, 422, 429, 500]) {
    let calls = 0
    const result = await sendContactEmail(context, { env: approved, fetchImpl: async () => { calls++; return { status: http } } })
    assert.deepEqual(result, { status: http >= 500 ? 'unknown' : 'rejected', providerHttp: http })
    assert.equal(calls, 1)
  }
  let calls = 0
  assert.deepEqual(await sendContactEmail(context, { env: approved, fetchImpl: async () => { calls++; throw new Error('private credential') } }), { status: 'unknown' })
  assert.equal(calls, 1)
})

test('respuesta exitosa sin ID válido no se confunde con aceptación y no filtra cuerpo', async () => {
  for (const data of [{}, { id: 'secret\nprivate' }, { error: 'provider private' }]) {
    assert.deepEqual(await sendContactEmail(context, { env: approved,
      fetchImpl: async () => ({ status: 200, json: async () => data }) }), { status: 'unknown' })
  }
})
