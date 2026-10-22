import { findContactService, PRIVACY_VERSION } from '../shared/contact-services.js'
import { DOWNLOAD_PRODUCTS } from '../shared/download-products.js'
import { createDownloadTicket } from '../server/download-ticket.js'
import { validatePublicFormRequest } from '../server/public-form-policy.js'
import { isLaunchPromotionActive } from '../assets/launch-promotion.js'
import { sendContactEmail } from '../server/contact-email.js'

// Service routing is independent of email delivery. The legacy webhook stays off.
export const ROUTES = {
  planilla: { pipeline: 14023387, source: 108238139, target: 108238131, tag: 22508 },
  web: { pipeline: 14023535, source: 108239235, target: 108239227, tag: 22510 },
  procesos: { pipeline: 14023539, source: 108246983, target: 108239243, tag: 22512 },
  plataforma: { pipeline: 14023551, source: 108239319, target: 108239311, tag: 22514 },
}

const clean = value => typeof value === 'string' ? value.replace(/\0/g, '').trim() : ''

export default async function handler(req, res) {
  const startedAt = Date.now()
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ success: false, error: 'Método no permitido.' })
  }
  const policyError = validatePublicFormRequest(req)
  if (policyError) return res.status(policyError.status).json({ success: false, error: policyError.error })
  let body = req.body
  if (typeof body === 'string') {
    try { body = JSON.parse(body) } catch { body = null }
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({ success: false, error: 'Solicitud inválida.' })
  }
  // Simple bot protection without another paid service.
  if (clean(body.website)) return res.status(400).json({ success: false, error: 'No pudimos validar el formulario. Escríbenos a servicios@adsveris.com si el problema continúa.' })
  const name = clean(body.name)
  const email = clean(body.email).toLowerCase()
  const phone = clean(body.phone)
  const details = clean(body.details).replace(/\r\n/g, '\n')
  const service = findContactService(body.serviceType)
  const sourcePage = clean(body.sourcePage)
  const downloadSlug = clean(body.downloadSlug)
  const download = downloadSlug && Object.hasOwn(DOWNLOAD_PRODUCTS, downloadSlug) ? DOWNLOAD_PRODUCTS[downloadSlug] : null
  const isDownload = service?.label === 'Descarga de planilla gratuita'
  if (isDownload && !isLaunchPromotionActive()) return res.status(410).json({ success: false, error: 'La promoción de inauguración finalizó. Consulta disponibilidad y precio en servicios@adsveris.com. No se ha realizado ningún cobro.' })
  const phoneValid = /^\+?[\d\s().-]{6,40}$/.test(phone) && phone.replace(/\D/g, '').length >= 6
  if (!name || name.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 ||
      (phone ? !phoneValid : !isDownload) || (isDownload && !download) || (!isDownload && downloadSlug) ||
      !service || details.length > 3000 || body.privacyConsent !== true) {
    return res.status(400).json({ success: false, error: 'Revisa nombre, correo, teléfono, servicio y autorización de contacto.' })
  }
  const { KOMMO_API_TOKEN: token, KOMMO_SUBDOMAIN: subdomain, KOMMO_ACCOUNT_ID: accountId } = process.env
  if (!token || !/^[a-z0-9-]+$/i.test(subdomain || '') || !accountId) {
    return res.status(503).json({ success: false, error: 'El formulario no está disponible. Escríbenos a servicios@adsveris.com.' })
  }
  const route = ROUTES[service.key]
  const base = `https://${subdomain}.kommo.com/api/v4`
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'X-Account-ID': accountId }
  let leadId
  let contactId
  let consentRecorded = false
  async function request(path, method = 'GET', payload) {
    const response = await fetch(`${base}${path}`, {
      method, headers, signal: AbortSignal.timeout(8000),
      ...(payload === undefined ? {} : { body: JSON.stringify(payload) }),
    })
    const parsed = await response.json().catch(() => ({}))
    const data = parsed && typeof parsed === 'object' ? parsed : {}
    if (!response.ok) {
      // No customer data, vendor payloads or credentials in logs/errors.
      const providerCode = /^Error code (\d{1,5})\./.exec(clean(data.detail))?.[1]
      console.error('Kommo request failed', { path, method, status: response.status, leadId,
        contentType: response.headers?.get?.('content-type'),
        accountRestriction: /payment|subscription|license|tariff|user.*limit|expired/i.test(`${data.title || ''} ${data.detail || ''}`),
        providerCode,
      })
      const validation = (Array.isArray(data['validation-errors']) ? data['validation-errors'] : [])
        .flatMap(item => Array.isArray(item?.errors) ? item.errors : []).slice(0, 20).map(item => ({
          code: /^[a-z0-9_-]{1,80}$/i.test(item?.code || '') ? item.code : 'unknown',
          path: /^[a-z0-9_.\[\]-]{1,150}$/i.test(item?.path || '') ? item.path : 'unknown',
        }))
      if (validation.length) console.error('Kommo validation fields', validation)
      if (response.status === 429) {
        const error = new Error('Kommo rate limited')
        const retry = Number(response.headers?.get?.('retry-after'))
        error.retryAfter = Number.isInteger(retry) && retry > 0 ? Math.min(retry, 300) : 60
        throw error
      }
      throw new Error(providerCode === '205' ? 'Kommo contact creation restricted' : 'Kommo request failed')
    }
    return data
  }
  try {
    const contacts = await request('/contacts', 'POST', [{
      name,
      custom_fields_values: [
        { field_code: 'EMAIL', values: [{ value: email, enum_code: 'WORK' }] },
        ...(phone ? [{ field_code: 'PHONE', values: [{ value: phone, enum_code: 'WORK' }] }] : []),
      ],
    }])
    contactId = (contacts?._embedded?.contacts?.[0] || contacts?.[0])?.id
    if (!Number.isSafeInteger(contactId) || contactId <= 0) throw new Error('Missing contact ID')
    const leads = await request('/leads', 'POST', [{
      name: `${download ? download.title + ' (gratis)' : service.label} - ${name}`, pipeline_id: route.pipeline,
      status_id: route.source, price: 0,
      _embedded: { tags: [{ id: route.tag }], contacts: [{ id: contactId, is_main: true }] },
    }])
    leadId = (leads?._embedded?.leads?.[0] || leads?.[0])?.id
    if (!Number.isSafeInteger(leadId) || leadId <= 0) { leadId = undefined; throw new Error('Missing lead ID') }
    const note = [
      'Solicitud desde el formulario web de ADS Veris', `Servicio solicitado: ${service.label}`,
      `Nombre: ${name}`, `Correo del cliente: ${email}`, `Teléfono: ${phone || 'No informado'}`,
      ...(download ? [`Planilla solicitada: ${download.title} (${downloadSlug})`] : []),
      `Problema o necesidad: ${details || 'No informado (campo opcional)'}`,
      `Página: ${sourcePage === '/contacto-kommo' || /^\/[a-z0-9/_-]+\.html$/i.test(sourcePage) ? sourcePage : 'Sitio web'}`,
      `Autorización: responder esta solicitud por correo o teléfono. Privacidad ${PRIVACY_VERSION}.`,
      `Comunicaciones comerciales por correo o teléfono: ${body.marketingConsent === true ? 'AUTORIZADAS expresamente (casilla opcional)' : 'NO autorizadas'}.`,
      `Fecha: ${new Date().toISOString()}`,
      'No constituye una contratación. Solo contactar para publicidad si consta autorización comercial expresa.',
    ].join('\n')
    await request(`/leads/${leadId}/notes`, 'POST', [{ note_type: 'common', params: { text: note } }])
    consentRecorded = true
    // Check the main recipient and tag before finishing service routing.
    const prepared = await request(`/leads/${leadId}?with=contacts`)
    if (prepared.pipeline_id !== route.pipeline ||
        !prepared._embedded?.contacts?.some(contact => contact.id === contactId && contact.is_main) ||
        !prepared._embedded?.tags?.some(tag => tag.id === route.tag)) {
      throw new Error('Lead is not ready for native email trigger')
    }
    await request(`/leads/${leadId}`, 'PATCH', {
      pipeline_id: route.pipeline, status_id: route.target,
      ...(body.marketingConsent === true ? { _embedded: { tags: [{ id: route.tag }, { name: 'Autoriza contacto comercial web' }] } } : {}),
    })
    const confirmed = await request(`/leads/${leadId}?with=contacts`)
    if (confirmed.pipeline_id !== route.pipeline || confirmed.status_id !== route.target) {
      throw new Error('Routing confirmation failed')
    }
    console.info('Kommo form routed', { leadId, contactId, service: service.key, pipeline: route.pipeline })
    // Only the validated requester is used. No public standalone email relay.
    // Leave time for the response; never lose a valid lead because mail failed.
    const mail = Date.now() - startedAt < 35000
      ? await sendContactEmail({ serviceKey: service.key, serviceLabel: service.label, name, email, leadId })
      : { status: 'deferred' }
    if (mail.status !== 'disabled') {
      console.info('Contact email result', { leadId, service: service.key, ...mail })
      const emailNote = mail.status === 'accepted'
        ? `Resend aceptó el acuse de esta solicitud. Referencia de envío: ${mail.providerId}. Esto no confirma recepción ni lectura. No se reintentará automáticamente.`
        : 'Acuse por correo pendiente. No reenviar el formulario ni reintentar automáticamente el envío. Revisar la integración de correo.'
      try {
        const saved = await fetch(`${base}/leads/${leadId}/notes`, {
          method: 'POST', headers, signal: AbortSignal.timeout(3000),
          body: JSON.stringify([{ note_type: 'common', params: { text: `[ADSVERIS_EMAIL_V2:${mail.status}] ${emailNote}` } }]),
        })
        if (!saved.ok) console.warn('Email status note unavailable', { leadId })
      } catch { console.warn('Email status note unavailable', { leadId }) }
    }
    return res.status(200).json({ success: true, leadReference: leadId,
      ...(mail.status !== 'disabled' ? { emailStatus: mail.status === 'accepted' ? 'accepted' : 'pending',
        message: mail.status === 'accepted'
          ? 'Registramos tu solicitud. El correo de confirmación se ha enviado al proveedor para su entrega; revisa también spam. No necesitas enviar el formulario de nuevo.'
          : 'Registramos tu solicitud en el CRM. El correo de confirmación está pendiente; nuestro equipo revisará tu caso. No necesitas enviar el formulario de nuevo.' } : {}),
      ...(download ? { downloadUrl: `/api/download-planilla?ticket=${createDownloadTicket(downloadSlug, leadId)}` } : {}),
    })
  } catch (error) {
    const safeReasons = ['Missing contact ID', 'Missing lead ID', 'Lead is not ready for native email trigger', 'Routing confirmation failed', 'Kommo request failed', 'Kommo contact creation restricted', 'Kommo rate limited']
    console.error('Kommo form incomplete', { leadId, contactId, reason: safeReasons.includes(error.message) ? error.message : error.name })
    if (leadId) {
      // Keep the request for an adviser; do not invite duplicate submissions.
      return res.status(202).json({
        success: true, pending: true,
        message: 'Recibimos tu solicitud. La confirmación automática está pendiente; no necesitas enviarla de nuevo.',
        ...(download && consentRecorded ? { downloadUrl: `/api/download-planilla?ticket=${createDownloadTicket(downloadSlug, leadId)}` } : {}),
      })
    }
    if (error.message === 'Kommo contact creation restricted') {
      return res.status(503).json({ success: false, error: 'El registro automático está temporalmente no disponible. Escríbenos a servicios@adsveris.com o por WhatsApp para gestionar tu solicitud.' })
    }
    if (error.message === 'Kommo rate limited') {
      res.setHeader('Retry-After', String(error.retryAfter))
      return res.status(429).json({ success: false, error: 'El registro está recibiendo muchas solicitudes. No reenvíes inmediatamente; consulta a servicios@adsveris.com si ya enviaste tus datos.' })
    }
    // A timed-out POST may have reached Kommo. Never retry it automatically.
    return res.status(502).json({ success: false, error: 'No pudimos confirmar el registro. No reenvíes inmediatamente: consulta a servicios@adsveris.com para evitar duplicar tu solicitud.' })
  }
}
