import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// Same service mapping and acknowledgement copy as the saved Kommo templates.
// The three original brochures are deliberately preserved byte-for-byte.
export const CONTACT_EMAIL_TEMPLATES = Object.freeze({
  planilla: {
    crmTemplate: 'Plantilla personalizada',
    subject: 'Recibimos tu solicitud de planillas | ADS Veris',
    title: 'Gracias por contactar a ADS Veris',
    paragraphs: [
      'Registramos tu solicitud relacionada con nuestras planillas Excel.',
      'Si solicitaste una descarga gratuita durante una promoción vigente, el archivo se habilita con el botón de descarga en el formulario de la web. Guarda una copia original. Si tienes una incidencia con el archivo, responde indicando el nombre de la planilla y el problema.',
      'Si solicitaste una planilla personalizada, nuestro equipo revisará tu caso y confirmará contigo alcance, precio y plazos antes de iniciar el trabajo.',
    ],
    link: '/tienda.html', linkLabel: 'Ver el catálogo de planillas',
    pdf: 'ADS_Veris_Planillas_Excel.pdf', sha256: '50bb0708616f34d578b395e2df259d77840318f6e3525dcb7aa7678d09b10d6a',
  },
  web: {
    crmTemplate: 'Pagina web', subject: 'Recibimos tu solicitud WordPress | ADS Veris',
    title: 'Recibimos tu solicitud de soporte WordPress',
    paragraphs: [
      'Gracias por contactarnos. Revisaremos tu solicitud de reparación, mantenimiento, alojamiento o mejora de tu página WordPress.',
      'Para el diagnóstico, responde con la dirección de tu web y una breve descripción del error o del resultado que necesitas. Si la web está caída, indícanos desde cuándo ocurre.',
      'Antes de realizar un trabajo confirmaremos contigo su alcance, precio final y plazos.',
    ],
    link: '/soluciones/paginas-web.html', linkLabel: 'Ver servicios y planes WordPress',
    pdf: 'ADS_Veris_Paginas_Web.pdf', sha256: '47625218867a1256a9310688f09b706df0030793a61c93d4d04687bd0a938d25',
  },
  procesos: {
    crmTemplate: 'Procesos', subject: 'Recibimos tu consulta de procesos | ADS Veris',
    title: 'Revisemos los procesos de tu negocio',
    paragraphs: [
      'Gracias por contarnos qué necesitas mejorar. Nuestro equipo revisará tu solicitud de diagnóstico y optimización de procesos.',
      'Responde a este correo con el área o proceso que quieres ordenar y el principal problema que enfrentas. No incluyas información sensible de tus clientes.',
      'Antes de comenzar acordaremos contigo el alcance, entregables, precio y plazos. Esta solicitud no genera cobros.',
    ],
    link: '/soluciones/procesos.html', linkLabel: 'Conocer el servicio de procesos',
    pdf: 'ADS_Veris_Procesos.pdf', sha256: '2f2b11e9a924f5d38398585467c1ef5b85ea57bcc4865f08503fec2fec0b1f23',
  },
  plataforma: {
    crmTemplate: 'Plataforma de datos', subject: 'Recibimos tu interés en la plataforma | ADS Veris',
    title: 'Gracias por tu interés en la plataforma',
    paragraphs: [
      'Registramos tu consulta sobre nuestra plataforma de análisis. Actualmente está en desarrollo y todavía no ofrecemos un acceso público operativo.',
      'Cuéntanos qué datos necesitas analizar y qué decisiones quieres mejorar. Un asesor podrá revisar contigo las alternativas disponibles hoy.',
      'Este registro no genera una contratación ni cobros. Solo recibirás futuras novedades comerciales si lo autorizaste por separado en el formulario.',
    ],
    link: '/plataforma.html', linkLabel: 'Ver el estado de la plataforma', pdf: null,
  },
})

const SITE = 'https://pymex-web.vercel.app'
const REPLY_TO = 'servicios@adsveris.com'
const WHATSAPP = 'https://wa.me/56983894129'
const BROCHURE_NOTICE = 'Adjuntamos el folleto original como material de referencia. Sus precios, promociones y funcionalidades corresponden a una versión anterior y no constituyen una oferta vigente. El alcance, precio final y plazos aplicables a tu solicitud se confirmarán contigo antes de contratar.'
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char])

export function buildContactEmail({ serviceKey, serviceLabel, name, email, leadId }, { from = 'noreply@adsveris.com', readPdf = filename => readFileSync(join(process.cwd(), 'pdfs', filename)) } = {}) {
  const template = Object.hasOwn(CONTACT_EMAIL_TEMPLATES, serviceKey) && CONTACT_EMAIL_TEMPLATES[serviceKey]
  if (!template || !Number.isSafeInteger(leadId) || leadId <= 0 || typeof name !== 'string' || !name.trim() || name.length > 100 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '') || email.length > 254 ||
      !/^[a-z0-9._+-]+@adsveris\.com$/i.test(from)) throw new Error('Invalid email context')
  const attachments = []
  if (template.pdf) {
    const pdf = readPdf(template.pdf)
    if (!Buffer.isBuffer(pdf) || pdf.subarray(0, 5).toString() !== '%PDF-' ||
        createHash('sha256').update(pdf).digest('hex') !== template.sha256) throw new Error('Original PDF missing or changed')
    attachments.push({ content: pdf.toString('base64'), filename: template.pdf, type: 'application/pdf', disposition: 'attachment' })
  }
  const paragraphs = [...template.paragraphs]
  if (serviceLabel) paragraphs.unshift(`Servicio seleccionado: ${String(serviceLabel).slice(0, 100)}.`)
  if (template.pdf) paragraphs.push(BROCHURE_NOTICE)
  paragraphs.push('Puedes responder directamente a este correo para conversar con nuestro equipo. No envíes contraseñas ni datos bancarios.')
  const footer = 'ADS Veris SpA · RUT 78.456.217-4 · Antonio Bellet 193, oficina 1210, Providencia, Chile.'
  const consent = 'Esta respuesta corresponde a tu solicitud; no te suscribe a publicidad.'
  const html = `<!doctype html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(template.subject)}</title></head>
<body style="margin:0;padding:0;background:#edf3f5;font-family:Arial,sans-serif;color:#243447">
<div style="display:none;max-height:0;overflow:hidden">Recibimos tu solicitud. Puedes responder a este correo para conversar con ADS Veris.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#edf3f5"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid #d7e4e7;border-radius:12px;overflow:hidden">
<tr><td style="background:#153b4f;padding:28px;color:#ffffff"><p style="margin:0 0 20px;font-size:23px;font-weight:bold">ADS <span style="color:#d7b761">Veris</span></p><h1 style="margin:0;font-size:24px;line-height:1.3">${escapeHtml(template.title)}</h1></td></tr>
<tr><td style="padding:28px;line-height:1.65;font-size:15px"><p style="margin:0 0 18px">Hola ${escapeHtml(name)},</p>${paragraphs.map(p => `<p style="margin:0 0 18px">${escapeHtml(p)}</p>`).join('')}
<p style="margin:24px 0"><a href="${SITE}${template.link}" style="color:#0f766e;font-weight:bold">${escapeHtml(template.linkLabel)}</a></p>
<table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background:#0f766e;border-radius:6px"><a href="${WHATSAPP}" style="display:inline-block;padding:13px 20px;color:#ffffff;text-decoration:none;font-weight:bold">Escribir por WhatsApp</a></td></tr></table>
<p style="margin:24px 0 0">Equipo ADS Veris<br><a href="mailto:${REPLY_TO}" style="color:#0f766e">${REPLY_TO}</a><br>WhatsApp: +56 9 8389 4129</p></td></tr>
<tr><td style="background:#f1f5f6;padding:20px 28px;font-size:12px;line-height:1.6">${footer}<br>${consent}<br><a href="${SITE}/privacidad.html" style="color:#0f766e">Política de privacidad</a><br>Referencia de solicitud: ${leadId}</td></tr></table></td></tr></table></body></html>`
  return {
    personalizations: [{ to: [{ email, name }], custom_args: { ads_veris_lead_id: String(leadId), ads_veris_service: serviceKey } }],
    from: { email: from, name: 'ADS Veris' }, reply_to: { email: REPLY_TO, name: 'Equipo ADS Veris' }, subject: template.subject,
    content: [
      { type: 'text/plain', value: [`Hola ${name},`, '', ...paragraphs, `${template.linkLabel}: ${SITE}${template.link}`, `WhatsApp: ${WHATSAPP}`, REPLY_TO, footer, consent, `Referencia: ${leadId}`].join('\n\n') },
      { type: 'text/html', value: html },
    ],
    ...(attachments.length ? { attachments } : {}),
    // A requested acknowledgement is not a marketing-tracking subscription.
    tracking_settings: { click_tracking: { enable: false, enable_text: false }, open_tracking: { enable: false }, subscription_tracking: { enable: false } },
  }
}

// Diagnostic mode performs read-only calls using the existing server credential.
// It never sends a message or claims a subscription is free based on a saved key.
export async function checkSendGridAccount({ env = process.env, fetchImpl = fetch } = {}) {
  if (!env.SENDGRID_API_KEY) return { status: 'missing_key' }
  const checks = await Promise.all(['/user/account', '/verified_senders'].map(async path => {
    try {
      const response = await fetchImpl(`https://api.sendgrid.com/v3${path}`, {
        headers: { Authorization: `Bearer ${env.SENDGRID_API_KEY}` }, signal: AbortSignal.timeout(4000),
      })
      return { http: response.status, data: response.ok ? await response.json() : {} }
    } catch { return { http: 0, data: {} } }
  }))
  const [account, senders] = checks
  const from = env.CONTACT_EMAIL_FROM || 'noreply@adsveris.com'
  return {
    status: 'checked', accountHttp: account.http, sendersHttp: senders.http,
    accountType: ['free', 'paid'].includes(account.data?.type) ? account.data.type : 'unknown',
    senderVerified: Array.isArray(senders.data?.results) && senders.data.results.some(s => s.verified === true && s.from_email?.toLowerCase() === from.toLowerCase()),
  }
}

export async function sendContactEmail(context, { env = process.env, fetchImpl = fetch } = {}) {
  const mode = env.CONTACT_EMAIL_MODE || 'off'
  if (mode === 'check') {
    let preview
    try { preview = buildContactEmail(context, { from: env.CONTACT_EMAIL_FROM || 'noreply@adsveris.com' }) }
    catch { return { status: 'configuration_error' } }
    return { ...await checkSendGridAccount({ env, fetchImpl }), pdfReady: true, pdfCount: preview.attachments?.length || 0 }
  }
  if (!['test', 'live'].includes(mode)) return { status: 'disabled' }
  // Explicit deployment approval is required after checking quota/billing and sender.
  if (env.CONTACT_EMAIL_BUDGET_APPROVED !== 'true') return { status: 'budget_unverified' }
  const testRecipients = (env.CONTACT_EMAIL_TEST_TO || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
  if (mode === 'test' && !testRecipients.includes(context.email?.toLowerCase())) return { status: 'test_recipient_blocked' }
  if (!env.SENDGRID_API_KEY) return { status: 'missing_key' }
  let payload
  try { payload = buildContactEmail(context, { from: env.CONTACT_EMAIL_FROM || 'noreply@adsveris.com' }) }
  catch { return { status: 'configuration_error' } }
  try {
    const response = await fetchImpl('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST', headers: { Authorization: `Bearer ${env.SENDGRID_API_KEY}`, 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(8000), body: JSON.stringify(payload),
    })
    // SendGrid acceptance is not proof that the recipient received the message.
    return response.status === 202 ? { status: 'accepted' } : { status: 'rejected', providerHttp: response.status }
  } catch { return { status: 'unknown' } } // Never retry a possibly accepted send.
}
