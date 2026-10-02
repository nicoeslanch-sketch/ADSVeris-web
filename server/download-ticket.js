import { createHmac, timingSafeEqual } from 'node:crypto'
import { DOWNLOAD_PRODUCTS } from '../shared/download-products.js'

const signature = payload => createHmac('sha256', process.env.KOMMO_API_TOKEN)
  .update(`adsveris-download-v1:${payload}`).digest('base64url')

export function createDownloadTicket(slug, leadId, now = Date.now()) {
  const payload = Buffer.from(JSON.stringify({ slug, leadId, expires: now + 10 * 60 * 1000 })).toString('base64url')
  return `${payload}.${signature(payload)}`
}

export function readDownloadTicket(ticket, now = Date.now()) {
  if (typeof ticket !== 'string' || ticket.length > 1000 || !process.env.KOMMO_API_TOKEN) return null
  const parts = ticket.split('.')
  if (parts.length !== 2) return null
  try {
    const actual = Buffer.from(parts[1], 'base64url')
    const expected = Buffer.from(signature(parts[0]), 'base64url')
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null
    const data = JSON.parse(Buffer.from(parts[0], 'base64url').toString())
    if (!Number.isSafeInteger(data.leadId) || data.leadId <= 0 || !Number.isFinite(data.expires) || data.expires <= now ||
        !Object.hasOwn(DOWNLOAD_PRODUCTS, data.slug)) return null
    return data
  } catch { return null }
}
