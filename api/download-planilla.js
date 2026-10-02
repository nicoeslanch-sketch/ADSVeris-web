import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { DOWNLOAD_PRODUCTS } from '../shared/download-products.js'
import { readDownloadTicket } from '../server/download-ticket.js'

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Método no permitido.' })
  }
  const ticket = readDownloadTicket(req.query?.ticket)
  if (!ticket) return res.status(403).json({ error: 'Enlace inválido o vencido. Solicita la descarga desde el catálogo.' })
  const product = DOWNLOAD_PRODUCTS[ticket.slug]
  try {
    const bytes = await readFile(join(process.cwd(), product.file))
    const extension = product.file.endsWith('.xlsm') ? 'xlsm' : 'xlsx'
    res.setHeader('Content-Type', extension === 'xlsm' ? 'application/vnd.ms-excel.sheet.macroEnabled.12' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename="ADS-Veris-${ticket.slug}.${extension}"`)
    return res.status(200).send(bytes)
  } catch {
    console.error('Planilla delivery unavailable', { slug: ticket.slug })
    return res.status(503).json({ error: 'No pudimos entregar el archivo. Escríbenos a servicios@adsveris.com.' })
  }
}
