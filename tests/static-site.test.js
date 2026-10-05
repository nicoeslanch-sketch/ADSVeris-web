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

test('Vicente tiene retrato accesible y se publica en el equipo sin placeholder pendiente', async () => {
  const html = await readFile('dist/nosotros.html', 'utf8')
  assert.match(html, /class="abt-team-avatar abt-team-avatar-vicente"/)
  assert.match(html, /src="assets\/images\/vicente-valderrama-mejorada\.png" alt="Vicente Valderrama"[^>]*loading="lazy"/)
  assert.doesNotMatch(html, /Fotografía pendiente/)
  const portrait = await readFile('dist/assets/images/vicente-valderrama-mejorada.png')
  assert.deepEqual([...portrait.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10])
  assert.equal(portrait.readUInt32BE(16), portrait.readUInt32BE(20), 'El retrato debe ser cuadrado para el marco circular')
})

test('Michel se publica como tercer integrante con su fotografía y biografía completa', async () => {
  const html = await readFile('dist/nosotros.html', 'utf8')
  assert.equal((html.match(/class="abt-team-card"/g) || []).length, 3)
  assert.match(html, /src="assets\/images\/michel-varela-mejorada\.png" alt="Michel Varela"[^>]*loading="lazy"/)
  assert.match(html, /<h3>Michel Varela<\/h3>\s*<strong>Procesos y datos<\/strong>/)
  assert.match(html, /Ingeniero Civil Industrial, especialista en innovación, análisis de datos y transformación digital/)
  assert.match(html, /contribuyan a un futuro más sostenible\./)
  const portrait = await readFile('dist/assets/images/michel-varela-mejorada.png')
  assert.deepEqual([...portrait.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10])
  assert.equal(portrait.readUInt32BE(16), 1254)
  assert.equal(portrait.readUInt32BE(16), portrait.readUInt32BE(20), 'El retrato restaurado debe ser cuadrado')
})
