// Shared by static pages, the React app and embedded contact forms.
// No Meta script, image or event before an explicit advertising choice.
;(function () {
  if (window.ADS_VERIS_PRIVACY) return
  const PIXEL = '1151078920784729'
  const KEY = 'adsveris:advertising-consent'
  const VERSION = '2026-10-22-meta-v1'
  const MAX_AGE = 180 * 24 * 60 * 60 * 1000
  const SERVICES = new Set(['planilla', 'web', 'procesos', 'plataforma'])
  const PRODUCTS = new Set(['balance-general', 'estado-de-resultados', 'plantilla-flujo-caja', 'presupuesto-mensual-control-desviaciones',
    'control-pyme-ingresos-gastos-ganancia', 'inventario-compras-stock', 'costeo-y-precio-productos', 'crm-clientes-ventas-cobranza',
    'dashboard-financiero', 'ratios-financieros-pyme-dashboard', 'finanzas-personales-presupuesto-mensual'])
  const PUBLIC_PATHS = new Set(['/', '/index.html', '/tienda.html', '/producto.html', '/contacto.html', '/contacto-kommo', '/app.html',
    '/plataforma.html', '/nosotros.html', '/ayuda.html', '/legal.html', '/terminos.html', '/privacidad.html', '/reembolsos.html',
    '/soluciones/', '/soluciones/index.html', '/soluciones/paginas-web.html', '/soluciones/procesos.html'])
  let consent = readChoice()
  let initialized = false
  let ready = false
  let loading = false
  let failed = false
  let lastPage = null
  let banner
  let preferences
  const pendingLeads = new Map()
  const sentLeads = new Set()

  function readChoice() {
    try {
      const stored = JSON.parse(window.localStorage.getItem(KEY))
      const age = Date.now() - stored?.updatedAt
      return stored?.version === VERSION && typeof stored.advertising === 'boolean' && age >= 0 && age < MAX_AGE ? stored.advertising : null
    } catch { return null }
  }

  function safePage() {
    try {
      const page = new URL(window.location.href)
      if (!PUBLIC_PATHS.has(page.pathname)) return false
      if (document.referrer) {
        const referrer = new URL(document.referrer)
        if (referrer.search || referrer.hash || (referrer.origin === page.origin && !PUBLIC_PATHS.has(referrer.pathname))) return false
      }
      // Do not send auth tokens, contact data, download tickets or arbitrary query strings.
      if (page.hash && !/^#[a-z][a-z0-9_-]{0,80}$/i.test(page.hash)) return false
      for (const [key, value] of page.searchParams) {
        if (key === 'servicio' && /^(?:Planilla Excel Personalizada|Página Web|Reparación urgente WordPress|Mantenimiento Esencial WordPress|Alojamiento Profesional WordPress|WordPress Integral|Optimización de Procesos|Plataforma de Análisis|Descarga de planilla gratuita)$/i.test(value)) continue
        if (['planilla', 'id'].includes(key) && PRODUCTS.has(value)) continue
        if (/^utm_(source|medium|campaign|term|content)$/.test(key) && /^[a-z0-9 _.-]{1,100}$/i.test(value) && !/\d{7,}/.test(value)) continue
        if (key === 'fbclid' && /^[a-z0-9_.-]{1,500}$/i.test(value)) continue
        return false
      }
      return true
    } catch { return false }
  }

  function allowed() { return consent === true && safePage() }

  function revoke() {
    pendingLeads.clear()
    try { if (window.fbq) window.fbq('consent', 'revoke') } catch {}
  }

  function loadPixel() {
    if (!allowed() || loading || ready || failed) return
    loading = true
    if (!window.fbq) {
      const fbq = function () { fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments) }
      fbq.push = fbq
      fbq.loaded = true
      fbq.version = '2.0'
      fbq.queue = []
      window.fbq = fbq
      window._fbq = fbq
    }
    // React Router emits its own PageViews; Meta must not auto-track history too.
    window.fbq.disablePushState = true
    const script = document.createElement('script')
    script.id = 'ads-veris-meta-sdk'
    script.async = true
    script.src = 'https://connect.facebook.net/en_US/fbevents.js'
    script.onload = function () {
      loading = false
      ready = true
      if (!allowed()) { revoke(); return }
      trackPageView()
      flushLeads()
    }
    script.onerror = function () { loading = false; failed = true; pendingLeads.clear() }
    document.head.appendChild(script)
  }

  function prepare() {
    if (!allowed()) { revoke(); return false }
    if (!ready) { loadPixel(); return false }
    try {
      window.fbq('consent', 'grant')
      if (!initialized) {
        // No automatic DOM/form events or advanced matching with contact details.
        window.fbq('set', 'autoConfig', false, PIXEL)
        window.fbq.disablePushState = true
        window.fbq('init', PIXEL)
        initialized = true
      }
    } catch { return false }
    return true
  }

  function trackPageView() {
    if (!prepare()) return false
    const page = window.location.pathname + window.location.search
    if (lastPage === page) return false
    try { window.fbq('track', 'PageView') } catch { return false }
    lastPage = page
    return true
  }

  function flushLeads() {
    if (!prepare()) return
    for (const [reference, service] of pendingLeads) {
      if (sentLeads.has(reference)) continue
      const eventID = window.crypto?.randomUUID?.() || `ads-${Date.now()}-${Math.random().toString(36).slice(2)}`
      try { window.fbq('track', 'Lead', { content_category: service }, { eventID }) } catch { continue }
      sentLeads.add(reference)
    }
    pendingLeads.clear()
  }

  function trackLead(reference, service) {
    if (!allowed() || !Number.isSafeInteger(reference) || reference <= 0 || !SERVICES.has(service) || sentLeads.has(reference)) return false
    // Only queue actions performed while advertising consent was already granted.
    pendingLeads.set(reference, service)
    if (!ready) loadPixel()
    else flushLeads()
    return true
  }

  function removePixelCookies() {
    for (const name of ['_fbp', '_fbc']) {
      const expiry = `${name}=; Max-Age=0; Path=/; SameSite=Lax; Secure`
      document.cookie = expiry
      const host = window.location.hostname
      const domains = new Set([host, `.${host}`])
      if (/(^|\.)adsveris\.com$/i.test(host)) domains.add('.adsveris.com')
      for (const domain of domains) document.cookie = `${expiry}; Domain=${domain}`
    }
  }

  function choose(advertising) {
    consent = advertising
    try { window.localStorage.setItem(KEY, JSON.stringify({ version: VERSION, advertising, updatedAt: Date.now() })) } catch {}
    if (advertising) trackPageView()
    else { revoke(); removePixelCookies() }
    renderChoice()
    preferences?.focus()
  }

  function element(tag, text, className) {
    const node = document.createElement(tag)
    if (text) node.textContent = text
    if (className) node.className = className
    return node
  }

  function renderChoice() {
    if (!banner) return
    banner.hidden = consent !== null
    preferences.hidden = consent === null
    preferences.textContent = consent === true ? 'Cookies: publicidad activada' : 'Cookies: solo necesarias'
    window.dispatchEvent(new CustomEvent('adsveris:privacy-visibility'))
  }

  function openPreferences() {
    if (!banner) return
    banner.hidden = false
    preferences.hidden = true
    window.dispatchEvent(new CustomEvent('adsveris:privacy-visibility'))
    document.getElementById('ads-consent-heading')?.focus()
  }

  function mount() {
    const style = element('link')
    style.rel = 'stylesheet'
    style.href = '/assets/meta-pixel.css'
    document.head.appendChild(style)
    banner = element('section', '', 'ads-consent')
    banner.id = 'ads-consent'
    banner.setAttribute('role', 'region')
    banner.setAttribute('aria-label', 'Preferencias de cookies publicitarias')
    const title = element('h2', 'Tú decides sobre las cookies')
    title.id = 'ads-consent-heading'
    title.tabIndex = -1
    const description = element('p', 'Con tu permiso usamos Meta Pixel para medir visitas y campañas publicitarias. Puedes rechazarlo sin perder acceso al formulario o las descargas. Aceptar cookies no autoriza correos ni llamadas comerciales.')
    const policy = element('a', 'Ver privacidad y cookies')
    policy.href = '/privacidad.html#cookies'
    const actions = element('div', '', 'ads-consent-actions')
    for (const [id, label, advertising] of [
      ['ads-consent-reject', 'Solo necesarias', false], ['ads-consent-accept', 'Aceptar publicidad', true],
    ]) {
      const button = element('button', label)
      button.id = id
      button.type = 'button'
      button.addEventListener('click', () => choose(advertising))
      actions.appendChild(button)
    }
    banner.append(title, description, policy, actions)
    preferences = element('button', '', 'ads-consent-preferences')
    preferences.id = 'ads-consent-open'
    preferences.type = 'button'
    preferences.setAttribute('aria-controls', 'ads-consent')
    preferences.addEventListener('click', openPreferences)
    document.body.append(banner, preferences)
    renderChoice()
    trackPageView()
  }

  window.ADS_VERIS_PRIVACY = Object.freeze({ openPreferences, trackPageView, trackLead })
  window.addEventListener('storage', event => {
    if (event.key !== KEY && event.key !== null) return
    consent = readChoice()
    if (consent === true) trackPageView()
    else { revoke(); removePixelCookies() }
    renderChoice()
  })
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true })
  else mount()
})()
