import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { runInNewContext } from 'node:vm'
import { PUBLIC_DOWNLOAD_PRODUCTS } from '../shared/public-download-products.js'

const source = await readFile('assets/meta-pixel.js', 'utf8')
const KEY = 'adsveris:advertising-consent'
const VERSION = '2026-10-22-meta-v1'
const choice = advertising => JSON.stringify({ version: VERSION, advertising, updatedAt: Date.now() })

function browser({ stored = null, url = 'https://pymex-web.vercel.app/index.html', storageFails = false, referrer = '' } = {}) {
  const elements = []
  const storage = new Map(stored ? [[KEY, stored]] : [])
  const windowEvents = {}
  const calls = []
  const cookies = []
  let focused
  function element(tag) {
    const listeners = {}
    const node = { tagName: tag, children: [], hidden: false,
      appendChild(child) { this.children.push(child) }, append(...children) { this.children.push(...children) },
      setAttribute(key, value) { this[key] = value },
      addEventListener(name, listener) { listeners[name] = listener },
      click() { listeners.click?.() }, focus() { focused = this.id },
    }
    elements.push(node)
    return node
  }
  const document = { readyState: 'complete', referrer, head: element('head'), body: element('body'),
    createElement: element, getElementById: id => elements.find(e => e.id === id),
  }
  Object.defineProperty(document, 'cookie', { get: () => '', set: value => cookies.push(value) })
  const window = { location: new URL(url), crypto: { randomUUID: () => 'test-event-id' },
    localStorage: { getItem(key) { if (storageFails) throw Error(); return storage.get(key) ?? null }, setItem(key, value) { if (storageFails) throw Error(); storage.set(key, value) } },
    addEventListener(name, listener) { (windowEvents[name] ||= []).push(listener) },
    dispatchEvent(event) { for (const fn of windowEvents[event.type] || []) fn(event) },
  }
  const context = { window, document, URL, Date, Math, CustomEvent: class { constructor(type) { this.type = type } } }
  const evaluate = () => runInNewContext(source, context)
  evaluate()
  return { window, document, elements, calls, cookies, storage, evaluate,
    click: id => document.getElementById(id).click(),
    sdk: () => elements.find(e => e.id === 'ads-veris-meta-sdk'),
    load() { window.fbq = (...args) => calls.push(args); this.sdk().onload() },
    route(path) { window.location = new URL(path, 'https://pymex-web.vercel.app'); window.ADS_VERIS_PRIVACY.trackPageView() },
    focused: () => focused,
  }
}

test('sin permiso o tras rechazar no se carga Meta, aunque se visite otra sección', () => {
  for (const stored of [null, choice(false), '{', choice('true'), JSON.stringify({ version: VERSION, advertising: true, updatedAt: 1 }), JSON.stringify({ version: 'obsolete', advertising: true, updatedAt: Date.now() })]) {
    const b = browser({ stored })
    assert.equal(b.sdk(), undefined)
    b.click('ads-consent-reject')
    b.route('/contacto.html')
    assert.equal(b.sdk(), undefined)
    assert.equal(b.calls.length, 0)
    assert.equal(b.window.ADS_VERIS_PRIVACY.trackLead(123, 'web'), false)
    assert.ok(b.cookies.some(c => c.startsWith('_fbp=; Max-Age=0')))
  }
})

test('aceptar carga una vez, inicializa el ID correcto y evita duplicados y eventos automáticos', () => {
  const b = browser()
  b.click('ads-consent-accept')
  assert.equal(b.sdk().src, 'https://connect.facebook.net/en_US/fbevents.js')
  assert.equal(b.calls.length, 0)
  b.load()
  b.evaluate() // module may also arrive through the embedded React widget
  b.window.ADS_VERIS_PRIVACY.trackPageView()
  b.window.ADS_VERIS_PRIVACY.trackPageView()
  assert.equal(b.elements.filter(e => e.id === 'ads-veris-meta-sdk').length, 1)
  assert.equal(b.elements.filter(e => e.id === 'ads-consent').length, 1)
  assert.equal(b.calls.filter(c => c[0] === 'init').length, 1)
  assert.deepEqual(b.calls.find(c => c[0] === 'init'), ['init', '1151078920784729'])
  assert.deepEqual(b.calls.find(c => c[0] === 'set'), ['set', 'autoConfig', false, '1151078920784729'])
  assert.equal(b.window.fbq.disablePushState, true)
  assert.equal(b.calls.filter(c => c[1] === 'PageView').length, 1)
  b.route('/contacto.html')
  assert.equal(b.calls.filter(c => c[1] === 'PageView').length, 2)
})

test('la revocación detiene eventos y descarta conversiones pendientes incluso durante la carga', () => {
  const b = browser()
  assert.equal(b.window.ADS_VERIS_PRIVACY.trackLead(1, 'web'), false)
  b.click('ads-consent-accept')
  b.window.ADS_VERIS_PRIVACY.trackLead(2, 'web')
  b.click('ads-consent-reject')
  b.load()
  assert.equal(b.calls.filter(c => c[0] === 'track').length, 0)
  assert.ok(b.calls.some(c => c[0] === 'consent' && c[1] === 'revoke'))
  b.route('/contacto.html')
  assert.equal(b.calls.filter(c => c[0] === 'track').length, 0)
})

test('Lead solo tras consentimiento, con referencia válida y categoría sin datos de contacto', () => {
  const b = browser({ stored: choice(true) })
  b.load()
  for (const id of [null, undefined, -1, 0, '123']) assert.equal(b.window.ADS_VERIS_PRIVACY.trackLead(id, 'web'), false)
  assert.equal(b.window.ADS_VERIS_PRIVACY.trackLead(123, 'customer@email.example'), false)
  b.window.ADS_VERIS_PRIVACY.trackLead(123, 'web')
  b.window.ADS_VERIS_PRIVACY.trackLead(123, 'web')
  const leads = b.calls.filter(c => c[1] === 'Lead')
  assert.equal(leads.length, 1)
  assert.equal(JSON.stringify(leads[0]), JSON.stringify(['track', 'Lead', { content_category: 'web' }, { eventID: 'test-event-id' }]))
  b.click('ads-consent-reject')
  assert.equal(b.window.ADS_VERIS_PRIVACY.trackLead(456, 'web'), false)
})

test('no carga ni envía en rutas privadas o URLs con tokens, correos o parámetros libres', () => {
  for (const path of ['/login', '/profile', '/profile.html', '/reset-password?code=secret', '/contacto-kommo#access_token=private', '/contacto.html?email=private@example.com', '/producto.html?id=private@example.com', '/api/download-planilla?ticket=private']) {
    const b = browser({ stored: choice(true), url: `https://pymex-web.vercel.app${path}` })
    assert.equal(b.sdk(), undefined, path)
  }
  const b = browser({ stored: choice(true) })
  b.load()
  const before = b.calls.filter(c => c[0] === 'track').length
  b.route('/reset-password#secret')
  assert.equal(b.calls.filter(c => c[0] === 'track').length, before)
  assert.ok(b.calls.some(c => c[0] === 'consent' && c[1] === 'revoke'))
})

test('rutas públicas, decisión entre pestañas, almacenamiento bloqueado y fallos del SDK', () => {
  const b = browser({ stored: choice(true), url: 'https://pymex-web.vercel.app/contacto-kommo?servicio=P%C3%A1gina%20Web' })
  b.load()
  b.storage.set(KEY, choice(false))
  b.window.dispatchEvent({ type: 'storage', key: KEY })
  assert.equal(b.window.ADS_VERIS_PRIVACY.trackLead(1, 'web'), false)
  const blocked = browser({ storageFails: true })
  assert.equal(blocked.sdk(), undefined)
  blocked.click('ads-consent-accept')
  assert.ok(blocked.sdk())
  blocked.sdk().onerror()
  assert.doesNotThrow(() => blocked.window.ADS_VERIS_PRIVACY.trackPageView())
})

test('entrada compartida para todas las páginas y aplicación, sin imagen noscript incondicional', async () => {
  const script = await readFile('assets/script.js', 'utf8')
  const app = await readFile('src/main.jsx', 'utf8')
  assert.match(script, /import '\.\/meta-pixel\.js'/)
  assert.match(app, /import '\.\.\/assets\/meta-pixel\.js'/)
  for (const page of ['index.html', 'contacto.html', 'tienda.html', 'nosotros.html', 'producto.html', 'plataforma.html', 'ayuda.html', 'legal.html', 'terminos.html', 'privacidad.html', 'reembolsos.html', 'soluciones/index.html', 'soluciones/paginas-web.html', 'soluciones/procesos.html']) {
    const html = await readFile(page, 'utf8')
    assert.match(html, /assets\/script\.js/)
    assert.doesNotMatch(html, /facebook\.com\/tr\?|fbevents\.js|fbq\(/)
  }
})

test('excluye fuentes con datos privados, acepta solo productos del catálogo y tolera errores de Meta', () => {
  for (const referrer of ['https://pymex-web.vercel.app/profile', 'https://other.example/?email=private@example.com']) {
    assert.equal(browser({ stored: choice(true), referrer }).sdk(), undefined)
  }
  for (const slug of Object.keys(PUBLIC_DOWNLOAD_PRODUCTS)) {
    assert.ok(browser({ stored: choice(true), url: `https://pymex-web.vercel.app/producto.html?id=${slug}` }).sdk())
  }
  for (const query of ['id=cliente-123456789', 'utm_campaign=cliente-123456789']) {
    assert.equal(browser({ stored: choice(true), url: `https://pymex-web.vercel.app/producto.html?${query}` }).sdk(), undefined)
  }
  const b = browser({ stored: choice(true) })
  b.load()
  b.window.fbq = () => { throw Error('Tracker unavailable') }
  assert.doesNotThrow(() => b.window.ADS_VERIS_PRIVACY.trackPageView())
  assert.doesNotThrow(() => b.click('ads-consent-reject'))
})
