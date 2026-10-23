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
  assert.match(html, /src="assets\/images\/michel-varela-mejorada\.png" alt="Michel Varela"[^>]*loading="lazy"/)
  assert.match(html, /<h3>Michel Varela<\/h3>\s*<strong>Procesos y datos<\/strong>/)
  assert.match(html, /Ingeniero Civil Industrial, especialista en innovación, análisis de datos y transformación digital/)
  assert.match(html, /contribuyan a un futuro más sostenible\./)
  const portrait = await readFile('dist/assets/images/michel-varela-mejorada.png')
  assert.deepEqual([...portrait.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10])
  assert.equal(portrait.readUInt32BE(16), 1254)
  assert.equal(portrait.readUInt32BE(16), portrait.readUInt32BE(20), 'El retrato restaurado debe ser cuadrado')
})

test('Ítalo se incorpora a Comercial y marketing sin alterar su formación científica', async () => {
  const html = await readFile('dist/nosotros.html', 'utf8')
  const card = html.match(/<article class="abt-team-card"[^>]*>(?:(?!<\/article>)[\s\S])*abt-team-avatar-italo[\s\S]*?<\/article>/)?.[0]
  assert.ok(card, 'Debe existir una tarjeta propia para Ítalo')
  assert.match(card, /<h3>Ítalo Baquedano<\/h3>\s*<strong>Comercial y marketing<\/strong>/)
  assert.match(card, /Biólogo marino/)
  assert.match(card, /R, RStudio y Excel/)
  assert.match(card, /métodos estadísticos/)
  assert.match(card, /información comercial, evaluar resultados/)
  assert.doesNotMatch(card, /Ingeniero|certificad|especialista en marketing|experto/)
  assert.match(card, /src="assets\/images\/italo-baquedano-retrato\.png" alt="Ítalo Baquedano"[^>]*loading="lazy"/)
  const portrait = await readFile('dist/assets/images/italo-baquedano-retrato.png')
  assert.deepEqual([...portrait.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10])
  assert.equal(portrait.readUInt32BE(16), portrait.readUInt32BE(20), 'El retrato debe ser cuadrado para el marco circular')
  const css = await readFile('dist/assets/styles.css', 'utf8')
  assert.match(css, /\.abt-team-grid\s*\{[^}]*repeat\(2, minmax\(0, 1fr\)\)/)
  assert.match(css, /@media \(max-width: 760px\)\s*\{\s*\.abt-team-grid \{ grid-template-columns: 1fr; \}/)
})

test('Colomba lidera marketing con retrato accesible y un perfil sin credenciales inventadas', async () => {
  const html = await readFile('dist/nosotros.html', 'utf8')
  assert.equal((html.match(/class="abt-team-card"/g) || []).length, 5)
  const card = html.match(/<article class="abt-team-card" id="colomba-giangrandi">[\s\S]*?<\/article>/)?.[0]
  assert.ok(card)
  assert.match(card, /<h3>Colomba Giangrandi<\/h3>\s*<strong>Líder de marketing<\/strong>/)
  assert.match(card, /Nutricionista con experiencia en coaching y creación de contenido/)
  assert.match(card, /comunicación clara/)
  assert.doesNotMatch(card, /Ingenier|certificad|años de experiencia|campañas exitosas|especialista|experta/)
  assert.match(card, /src="assets\/images\/colomba-giangrandi-retrato\.png" alt="Colomba Giangrandi"[^>]*loading="lazy"/)
  const portrait = await readFile('dist/assets/images/colomba-giangrandi-retrato.png')
  assert.deepEqual([...portrait.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10])
  assert.equal(portrait.readUInt32BE(16), portrait.readUInt32BE(20))
  const css = await readFile('dist/assets/styles.css', 'utf8')
  assert.match(css, /@media \(min-width: 761px\)\s*\{\s*\.abt-team-card:nth-child\(odd\):last-child/)
})

test('el formulario distingue registro operativo de confirmación por correo pendiente', async () => {
  const source = await readFile('src/components/KommoContactForm.jsx', 'utf8')
  assert.match(source, /Tu solicitud se registra en nuestro CRM/)
  assert.match(source, /Al enviarla te indicaremos el estado de la confirmación por correo/)
  assert.doesNotMatch(source, /Registro automático temporalmente no disponible/)
})
