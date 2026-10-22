import { createServer } from 'node:http'
import { buildContactEmail, CONTACT_EMAIL_TEMPLATES } from '../server/contact-email.js'

// Local-only, no credentials and no sending. Fixed routes; no filesystem paths from requests.
const pages = Object.fromEntries(Object.keys(CONTACT_EMAIL_TEMPLATES).map(serviceKey => [
  `/${serviceKey}`, buildContactEmail({ serviceKey, name: 'Cliente de ejemplo', email: 'preview@example.com', leadId: 123 }).html,
]))
createServer((req, res) => {
  const pathname = new URL(req.url, 'http://127.0.0.1').pathname
  const mobilePath = pathname.startsWith('/mobile/') ? pathname.slice('/mobile'.length) : ''
  const page = Object.hasOwn(pages, pathname) ? pages[pathname]
    : Object.hasOwn(pages, mobilePath) ? `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Vista móvil del correo</title></head><body style="margin:0;background:#d7e4e7"><iframe title="Correo a 375 píxeles" src="${mobilePath}" style="display:block;width:375px;max-width:100%;height:1050px;border:0;margin:auto"></iframe></body></html>` : null
  res.writeHead(page ? 200 : 404, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' })
  res.end(page || 'Vista previa no encontrada')
}).listen(4174, '127.0.0.1', () => console.log('Vistas previas locales: http://127.0.0.1:4174/{planilla,web,procesos,plataforma}'))
