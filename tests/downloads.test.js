import { test, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { runInNewContext } from 'node:vm'
import { DOWNLOAD_PRODUCTS } from '../shared/download-products.js'
import { PUBLIC_DOWNLOAD_PRODUCTS } from '../shared/public-download-products.js'
import { createDownloadTicket, readDownloadTicket } from '../server/download-ticket.js'
import downloadHandler from '../api/download-planilla.js'

const previousToken = process.env.KOMMO_API_TOKEN
afterEach(() => { if (previousToken === undefined) delete process.env.KOMMO_API_TOKEN; else process.env.KOMMO_API_TOKEN = previousToken })

test('tickets firmados, vencimiento y manipulación', () => {
  process.env.KOMMO_API_TOKEN = 'test-only'
  const ticket = createDownloadTicket('balance-general', 22, 1000)
  assert.equal(readDownloadTicket(ticket, 1100).slug, 'balance-general')
  assert.equal(readDownloadTicket(ticket, 601000), null)
  assert.equal(readDownloadTicket(ticket.replace('balance', 'other') + 'tampered', 1100), null)
  assert.equal(readDownloadTicket(createDownloadTicket('../../secret', 22, 1000), 1100), null)
  assert.equal(readDownloadTicket(['invalid']), null)
  assert.equal(readDownloadTicket(createDownloadTicket('balance-general', -1, 1000), 1100), null)
})

test('catálogo gratuito coincide con los once archivos entregables', async () => {
  const context = { window: {} }
  runInNewContext(await readFile('assets/products.js', 'utf8'), context)
  const products = context.window.ADS_VERIS_PRODUCTS
  assert.equal(products.length, 11)
  assert.equal(Object.keys(DOWNLOAD_PRODUCTS).length, products.length)
  for (const product of products) {
    assert.equal(product.price, 'Gratis')
    assert.equal(DOWNLOAD_PRODUCTS[product.slug]?.title, PUBLIC_DOWNLOAD_PRODUCTS[product.slug]?.title)
    assert.equal(product.download, undefined)
    assert.equal(product.downloadName, undefined)
    const bytes = await readFile(DOWNLOAD_PRODUCTS[product.slug].file)
    assert.ok(bytes.length > 0)
    assert.equal(bytes.subarray(0, 2).toString(), 'PK')
  }
})

test('endpoint entrega Excel solo con ticket válido y no permite traversal', async () => {
  process.env.KOMMO_API_TOKEN = 'test-only'
  const res = { headers: {}, setHeader(k,v) { this.headers[k]=v }, status(code) { this.code=code; return this }, json(body) { this.body=body }, send(body) { this.body=body } }
  await downloadHandler({ method: 'GET', url: '/api/download-planilla?ticket=invalid' }, res)
  assert.equal(res.code, 403)
  await downloadHandler({ method: 'GET', url: `/api/download-planilla?ticket=${createDownloadTicket('balance-general', 22)}`,
    get query() { throw new Error('Must not read the legacy framework getter') } }, res)
  assert.equal(res.code, 200)
  assert.ok(Buffer.isBuffer(res.body))
  assert.match(res.headers['Content-Disposition'], /attachment/)
  assert.equal(res.headers['Cache-Control'], 'private, no-store')
})

test('lectura de URL rechaza tickets repetidos y solicitudes malformadas', async () => {
  process.env.KOMMO_API_TOKEN = 'test-only'
  const ticket = createDownloadTicket('balance-general', 22)
  for (const url of [undefined, '/api/download-planilla', '/api/download-planilla?ticket=',
    `/api/download-planilla?ticket=${ticket}&ticket=${ticket}`, 'https://[', '/api/download-planilla?ticket=' + 'x'.repeat(2100)]) {
    const res = { setHeader() {}, status(code) { this.code = code; return this }, json(body) { this.body = body } }
    await downloadHandler({ method: 'GET', url }, res)
    assert.equal(res.code, 403)
  }
})
