import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { buildContactEmail, CONTACT_EMAIL_TEMPLATES, sendContactEmail, checkSendGridAccount } from '../server/contact-email.js'

const context = { serviceKey: 'web', serviceLabel: 'Reparación urgente WordPress', name: 'Nicolás <img src=x onerror=alert(1)>', email: 'test@example.com', leadId: 123 }
const approved = { CONTACT_EMAIL_MODE: 'test', CONTACT_EMAIL_BUDGET_APPROVED: 'true', CONTACT_EMAIL_TEST_TO: 'test@example.com', SENDGRID_API_KEY: 'test-only' }

test('los tres adjuntos son exactamente los PDFs originales, con un mensaje específico por servicio', () => {
  for (const [serviceKey, template] of Object.entries(CONTACT_EMAIL_TEMPLATES)) {
    const mail = buildContactEmail({ ...context, serviceKey })
    assert.equal(mail.subject, template.subject)
    assert.deepEqual(mail.personalizations[0].to, [{ email: context.email, name: context.name }])
    assert.equal(mail.reply_to.email, 'servicios@adsveris.com')
    assert.equal(mail.from.name, 'ADS Veris')
    assert.equal(mail.content[0].type, 'text/plain')
    const html = mail.content[1].value
    assert.match(html, /<table role="presentation"/)
    assert.match(html, /https:\/\/wa.me\/56983894129/)
    assert.match(html, /Nicolás &lt;img/)
    assert.doesNotMatch(html, /<img src=x|\{\{contact.name\}\}/)
    assert.match(html, /no te suscribe a publicidad/)
    assert.equal(mail.tracking_settings.open_tracking.enable, false)
    assert.equal(mail.tracking_settings.click_tracking.enable, false)
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
  for (const invalid of [{ serviceKey: '../secret' }, { serviceKey: 'toString' }, { email: 'test@example.com\r\nBcc:other@example.com' }, { leadId: 0 }]) {
    assert.throws(() => buildContactEmail({ ...context, ...invalid }), /Invalid email context/)
  }
  assert.throws(() => buildContactEmail(context, { from: 'attacker@example.com' }), /Invalid email context/)
  assert.throws(() => buildContactEmail(context, { readPdf: () => Buffer.from('%PDF-changed') }), /PDF missing or changed/)
})

test('sin aprobación de costos o destinatario permitido no se contacta al proveedor', async () => {
  const fetchImpl = () => { throw new Error('Must not call SendGrid') }
  assert.equal((await sendContactEmail(context, { env: {}, fetchImpl })).status, 'disabled')
  assert.equal((await sendContactEmail(context, { env: { CONTACT_EMAIL_MODE: 'live' }, fetchImpl })).status, 'budget_unverified')
  assert.equal((await sendContactEmail(context, { env: { ...approved, CONTACT_EMAIL_TEST_TO: '' }, fetchImpl })).status, 'test_recipient_blocked')
})

test('diagnóstico es solo lectura y no expone credenciales ni datos del proveedor', async () => {
  const calls = []
  const result = await checkSendGridAccount({ env: approved, fetchImpl: async (url, options) => {
    calls.push({ url, options })
    return { status: 200, ok: true, json: async () => url.endsWith('/user/account') ? { type: 'free', reputation: 100, private: 'hidden' } : { results: [{ from_email: 'noreply@adsveris.com', verified: true, address: 'private' }] } }
  } })
  assert.deepEqual(result, { status: 'checked', accountHttp: 200, sendersHttp: 200, accountType: 'free', senderVerified: true })
  assert.ok(calls.every(c => c.options.method === undefined && !c.options.body))
  assert.doesNotMatch(JSON.stringify(result), /test-only|hidden|private/)
  const denied = await sendContactEmail(context, { env: { ...approved, CONTACT_EMAIL_MODE: 'check' }, fetchImpl: async () => ({ status: 403, ok: false }) })
  assert.equal(denied.accountHttp, 403)
  assert.equal(denied.accountType, 'unknown')
})

test('envío usa solo el destinatario validado, adjunta PDF y diferencia aceptación de entrega', async () => {
  let calls = 0
  const result = await sendContactEmail(context, { env: approved, fetchImpl: async (url, options) => {
    calls++
    assert.equal(url, 'https://api.sendgrid.com/v3/mail/send')
    assert.equal(options.method, 'POST')
    const body = JSON.parse(options.body)
    assert.equal(body.attachments[0].filename, 'ADS_Veris_Paginas_Web.pdf')
    assert.equal(body.personalizations[0].to[0].email, context.email)
    assert.equal(body.personalizations[0].bcc, undefined)
    return { status: 202 }
  } })
  assert.deepEqual(result, { status: 'accepted' })
  assert.equal(calls, 1)
})

test('error, cuota y timeout no producen reintentos ni afirmaciones de correo entregado', async () => {
  for (const http of [400, 401, 403, 429, 500]) {
    let calls = 0
    const result = await sendContactEmail(context, { env: approved, fetchImpl: async () => { calls++; return { status: http } } })
    assert.deepEqual(result, { status: 'rejected', providerHttp: http })
    assert.equal(calls, 1)
  }
  let calls = 0
  assert.deepEqual(await sendContactEmail(context, { env: approved, fetchImpl: async () => { calls++; throw new Error('private credential') } }), { status: 'unknown' })
  assert.equal(calls, 1)
})
