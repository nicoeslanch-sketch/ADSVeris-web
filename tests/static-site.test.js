import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { runInNewContext } from 'node:vm'
import { DOWNLOAD_PRODUCTS } from '../shared/download-products.js'

test('rutas de imágenes y páginas coinciden incluso en servidores sensibles a mayúsculas', async () => {
  const files = new Set()
  async function walk(directory, prefix = '') {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const relative = `${prefix}${entry.name}`
      if (entry.isDirectory()) await walk(path.join(directory, entry.name), `${relative}/`)
      else files.add(relative)
    }
  }
  await walk('dist')
  const allowedRoutes = new Set(['contacto-kommo', 'login', 'register', 'profile', 'dashboard', 'forgot-password', 'reset-password', 'email-confirmed'])
  const errors = []
  for (const file of [...files].filter(file => file.endsWith('.html'))) {
    const html = await readFile(path.join('dist', file), 'utf8')
    for (const [, raw] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      if (!raw || /^(https?:|mailto:|tel:|data:|#)/i.test(raw)) continue
      const target = decodeURIComponent(raw.split(/[?#]/)[0])
      const resolved = target.startsWith('/') ? target.slice(1) : path.posix.normalize(path.posix.join(path.posix.dirname(file), target))
      if (!files.has(resolved) && !allowedRoutes.has(resolved)) errors.push(`${file}: ${raw}`)
    }
  }
  const context = { window: {} }
  runInNewContext(await readFile('assets/products.js', 'utf8'), context)
  for (const product of context.window.ADS_VERIS_PRODUCTS) {
    for (const image of [product.thumb, ...product.images]) if (!files.has(image)) errors.push(`${product.slug}: ${image}`)
    assert.ok(!files.has(DOWNLOAD_PRODUCTS[product.slug].file), `Excel must not be public: ${product.slug}`)
  }
  assert.deepEqual(errors, [])
})
