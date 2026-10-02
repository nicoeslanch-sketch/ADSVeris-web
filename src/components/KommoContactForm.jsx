import { useEffect, useRef, useState } from 'react'
import { CONTACT_SERVICES, findContactService } from '../../shared/contact-services.js'
import './kommo-contact.css'
import { isLaunchPromotionActive, LAUNCH_PROMOTION } from '../../assets/launch-promotion.js'
import { submitContactForm } from '../../shared/submit-contact-form.js'

const SERVICES = CONTACT_SERVICES.map(service => service.label)

function createInitialForm(defaultService = SERVICES[0]) {
  return {
    name: '',
    email: '',
    phone: '',
    serviceType: findContactService(defaultService)?.label || SERVICES[0],
    details: '',
    privacyConsent: false,
    website: '',
    marketingConsent: false,
  }
}

export default function KommoContactForm({ isOpen = true, onClose, defaultService = SERVICES[0], downloadProduct = null }) {
  const isCompact = useIsCompact()
  const [form, setForm] = useState(() => createInitialForm(defaultService))
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState({ type: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState('')
  const dialogRef = useRef(null)
  const submitting = useRef(false)
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  const canClose = typeof onClose === 'function'
  const isSuccess = status.type === 'success'

  const isDownload = Boolean(downloadProduct)
  const downloadSlug = downloadProduct?.slug || ''
  const campaignActive = isLaunchPromotionActive()
  const title = isSuccess ? (isDownload && downloadUrl ? 'Tu planilla está lista' : 'Solicitud recibida') : (isDownload ? (campaignActive ? 'Tu planilla, gratis por inauguración' : 'La promoción finalizó') : 'Conversemos sobre tu proyecto')

  useEffect(() => {
    if (!isOpen) return
    setStatus({ type: '', message: '' })
    setErrors({})
    setDownloadUrl('')
    // Every new request needs its own explicit choices; never inherit consent.
    setForm(createInitialForm(defaultService))
  }, [defaultService, isOpen, downloadSlug])

  useEffect(() => {
    if (!isOpen || !canClose) return
    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    const background = [...document.body.children].filter(node => !node.contains(dialogRef.current))
    const inertStates = background.map(node => [node, node.inert])
    background.forEach(node => { node.inert = true })
    document.body.style.overflow = 'hidden'
    dialogRef.current?.querySelector('h2')?.focus({ preventScroll: true })
    function handleKey(event) {
      if (event.key === 'Escape' && !submitting.current) closeRef.current?.()
      if (event.key !== 'Tab') return
      const controls = [...dialogRef.current.querySelectorAll('button, input, select, textarea, a[href]')]
        .filter(node => !node.disabled && node.tabIndex !== -1 && node.getClientRects().length)
      const first = controls[0]
      const last = controls[controls.length - 1]
      if (event.shiftKey && (document.activeElement === first || !controls.includes(document.activeElement))) {
        event.preventDefault(); last?.focus()
      } else if (!event.shiftKey && (document.activeElement === last || !controls.includes(document.activeElement))) {
        event.preventDefault(); first?.focus()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = previousOverflow
      inertStates.forEach(([node, wasInert]) => { node.inert = wasInert })
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true })
    }
  }, [isOpen, canClose])

  useEffect(() => {
    if (Object.keys(errors).length) dialogRef.current?.querySelector('[aria-invalid="true"]')?.focus()
  }, [errors])

  if (!isOpen) return null

  function handleChange(event) {
    const { name, value, type, checked } = event.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    setErrors(prev => ({ ...prev, [name]: '' }))
    setStatus({ type: '', message: '' })
  }

  function validate() {
    const nextErrors = {}
    if (!form.name.trim()) nextErrors.name = 'Ingresa tu nombre'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) nextErrors.email = 'Ingresa un correo válido'
    if ((!isDownload || form.phone.trim()) && (!/^\+?[\d\s().-]{6,40}$/.test(form.phone.trim()) || form.phone.replace(/\D/g, '').length < 6)) nextErrors.phone = 'Ingresa un teléfono válido'
    if (!SERVICES.includes(form.serviceType)) nextErrors.serviceType = 'Selecciona un servicio'
    if (!form.privacyConsent) nextErrors.privacyConsent = 'Autoriza el contacto para poder responder tu solicitud'
    return nextErrors
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (submitting.current) return
    const nextErrors = validate()
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    submitting.current = true
    setLoading(true)
    setStatus({ type: '', message: '' })

    try {
      const data = await submitContactForm({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        serviceType: form.serviceType,
        details: form.details.trim(),
        privacyConsent: form.privacyConsent,
        website: form.website,
        sourcePage: window.location.pathname,
        downloadSlug,
        marketingConsent: form.marketingConsent,
      })

      setStatus({
        type: 'success',
        message: data.message,
      })
      if (isDownload) setDownloadUrl(data.downloadUrl)
      setForm(createInitialForm(defaultService))
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.message || 'Ocurrió un error. Intenta nuevamente.',
      })
    } finally {
      setLoading(false)
      submitting.current = false
    }
  }

  return (
    <div className="kommo-contact" style={{ ...s.overlay, ...(isCompact ? s.overlayCompact : {}) }} role="presentation" onClick={canClose && !loading ? onClose : undefined}>
      <section
        ref={dialogRef}
        style={{ ...s.modal, ...(isCompact ? s.modalCompact : {}) }}
        role={canClose ? 'dialog' : 'region'}
        aria-modal={canClose ? 'true' : undefined}
        aria-labelledby="kommo-contact-title"
        onClick={event => event.stopPropagation()}
      >
        <div style={{ ...s.brandPanel, ...(isCompact ? s.brandPanelCompact : {}) }}>
          <div style={s.brandGlow} aria-hidden="true" />
          <div style={s.logoRow}>
            <img src="/images/logo-ads-veris.png" alt="ADS Veris" style={s.logo} />
            <strong style={s.brandName}>ADS <span style={s.goldText}>Veris</span></strong>
          </div>
          <img src="/images/oreja celu.png" alt="" style={{ ...s.agentImage, ...(isCompact ? s.agentImageCompact : {}) }} />
          <div style={s.colorRail} aria-hidden="true">
            <span style={{ ...s.railDot, background: '#0f766e' }} />
            <span style={{ ...s.railDot, background: '#c9a84c' }} />
            <span style={{ ...s.railDot, background: '#f06a5b' }} />
          </div>
        </div>

        <div style={{ ...s.content, ...(isCompact ? s.contentCompact : {}) }}>
          <div style={s.header}>
            <div>
              <p style={s.eyebrow}>ADS Veris</p>
              <h2 id="kommo-contact-title" tabIndex={-1} style={s.title}>{title}</h2>
              <p style={s.subtitle}>{isDownload ? (campaignActive ? `${downloadProduct.title} · $0 CLP. Oferta temporal hasta el ${LAUNCH_PROMOTION.deadlineLabel}. Publicidad opcional.` : 'La oferta gratuita de inauguración terminó. Puedes consultar disponibilidad y precio; no se realiza ningún cobro automático.') : 'Elige el servicio que necesitas y cuéntanos tu caso. Te responderemos a tu correo. Solicitar información no tiene costo ni compromiso.'}</p>
              {isDownload && campaignActive && <a href="/terminos.html#promocion-inauguracion" style={{ color: '#08665f', fontSize: '12px' }}>Condiciones de inauguración</a>}
            </div>
            {canClose && (
              <button type="button" aria-label="Cerrar" style={s.closeButton} onClick={onClose} disabled={loading}>
                ×
              </button>
            )}
            {!canClose && <a href="/index.html" style={{ color: '#0f766e', fontSize: '12px' }}>Volver al sitio</a>}
          </div>

          {status.message && (
            <div role={status.type === 'error' ? 'alert' : 'status'} style={status.type === 'success' ? s.successBox : s.errorBox}>
              {status.message}
              {status.type === 'error' && <p style={{ margin: '8px 0 0' }}>
                <a href="mailto:servicios@adsveris.com" style={{ color: 'inherit' }}>Contactar por correo</a>
                {' · '}
                <a href="https://wa.me/56983894129" style={{ color: 'inherit' }} target="_blank" rel="noopener noreferrer">Contactar por WhatsApp</a>
              </p>}
            </div>
          )}
          {!isSuccess && window.ADS_VERIS_CONFIG?.contactAutomationPending === true && <aside style={{ ...s.errorBox, background: '#fff8e5', color: '#59451c', borderColor: '#ead6a3', fontWeight: 400 }} aria-label="Aviso de atención">
            Registro automático temporalmente no disponible. Solicita atención por{' '}
            <a href="mailto:servicios@adsveris.com" style={{ color: 'inherit' }}>correo</a> o{' '}
            <a href="https://wa.me/56983894129" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>WhatsApp</a>.
          </aside>}
          {isSuccess && downloadUrl && <a href={downloadUrl} style={{ ...s.submitButton, display: 'block', padding: '14px', textAlign: 'center', textDecoration: 'none' }}>Descargar archivo Excel</a>}
          {isSuccess && isDownload && downloadUrl && <p className="kommo-contact-hint">El enlace caduca en 10 minutos. Guarda una copia original. Solo habilita macros si confías en el archivo y las necesitas.</p>}

          {isDownload && !campaignActive && <a href="/contacto-kommo?servicio=Planilla%20Excel%20personalizada" style={{ ...s.submitButton, display: 'block', padding: '14px', textAlign: 'center', textDecoration: 'none' }}>Consultar por una planilla</a>}
          {!isSuccess && (!isDownload || campaignActive) && (
            <form onSubmit={handleSubmit} noValidate style={s.form}>
              <Field
                label="Nombre"
                name="name"
                value={form.name}
                onChange={handleChange}
                error={errors.name}
                placeholder="Tu nombre"
                maxLength={100}
                autoComplete="name"
              />
              <Field
                label="Correo electrónico"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="tu@email.com"
                maxLength={254}
                autoComplete="email"
              />
              <Field
                label={isDownload ? 'Teléfono (opcional)' : 'Teléfono'}
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                error={errors.phone}
                placeholder="+56 9 1234 5678"
                maxLength={40}
                autoComplete="tel"
              />

              {!isDownload && <div style={s.field}>
                <label htmlFor="serviceType" style={s.label}>Servicio</label>
                <select
                  id="serviceType"
                  name="serviceType"
                  value={form.serviceType}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.serviceType)}
                  aria-describedby={errors.serviceType ? 'service-error' : undefined}
                  style={{ ...s.input, ...s.select, ...(errors.serviceType ? s.inputError : {}) }}
                >
                  {SERVICES.filter(service => service !== 'Descarga de planilla gratuita').map(service => (
                    <option key={service} value={service}>{service}</option>
                  ))}
                </select>
                {errors.serviceType && <span id="service-error" style={s.errorText}>{errors.serviceType}</span>}
              </div>}

              <div className="kommo-contact-honeypot" aria-hidden="true">
                <label htmlFor="contact-website">Sitio web</label>
                <input id="contact-website" name="website" value={form.website} onChange={handleChange} tabIndex={-1} autoComplete="off" />
              </div>
              <div style={s.field}>
                <label className="kommo-contact-consent">
                  <input name="privacyConsent" type="checkbox" checked={form.privacyConsent} onChange={handleChange}
                    aria-invalid={Boolean(errors.privacyConsent)} aria-describedby={errors.privacyConsent ? 'consent-error' : undefined} />
                  <span>Autorizo a ADS Veris SpA a usar estos datos para {isDownload ? 'registrar y gestionar esta descarga' : 'responder mi solicitud por correo o teléfono'}, según su <a href="/privacidad.html" target="_blank" rel="noopener noreferrer">política de privacidad</a>. Esto no autoriza publicidad.</span>
                </label>
                {errors.privacyConsent && <span id="consent-error" style={s.errorText}>{errors.privacyConsent}</span>}
                <p className="kommo-contact-hint">No compartas contraseñas ni datos sensibles en la descripción.</p>
                <label className="kommo-contact-consent">
                  <input name="marketingConsent" type="checkbox" checked={form.marketingConsent} onChange={handleChange} />
                  <span>Quiero recibir novedades y ofertas de ADS Veris por correo y, si dejo mi teléfono, llamadas comerciales. Es opcional y puedo retirar mi autorización en servicios@adsveris.com.</span>
                </label>
              </div>

              <div style={s.field}>
                <label htmlFor="details" style={s.label}>
                  Describe tu problema o lo que necesitas <span style={s.optionalLabel}>(opcional)</span>
                </label>
                <textarea
                  id="details"
                  name="details"
                  value={form.details}
                  onChange={handleChange}
                  placeholder="Cuéntanos brevemente qué ocurre, qué necesitas o qué resultado esperas."
                  maxLength={3000}
                  rows={4}
                  style={{ ...s.input, ...s.textarea }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ ...s.submitButton, opacity: loading ? 0.65 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
              >
                {loading ? 'Enviando...' : isDownload ? 'Obtener descarga gratuita' : 'Enviar solicitud'}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  )
}

function Field({ label, name, type = 'text', value, onChange, error, placeholder, maxLength, autoComplete }) {
  return (
    <div style={s.field}>
      <label htmlFor={name} style={s.label}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        style={{ ...s.input, ...(error ? s.inputError : {}) }}
      />
      {error && <span id={`${name}-error`} style={s.errorText}>{error}</span>}
    </div>
  )
}

function useIsCompact(maxWidth = 720) {
  const [isCompact, setIsCompact] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth <= maxWidth
  })

  useEffect(() => {
    function handleResize() {
      setIsCompact(window.innerWidth <= maxWidth)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [maxWidth])

  return isCompact
}

const s = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '24px',
    background: 'rgba(7, 18, 31, 0.72)',
    backdropFilter: 'blur(12px)',
    fontFamily: "'Poppins', 'Manrope', sans-serif",
  },
  overlayCompact: {
    alignItems: 'flex-start',
    padding: '12px',
    overflowY: 'auto',
  },
  modal: {
    width: 'min(94vw, 820px)',
    maxHeight: '92vh',
    overflow: 'auto',
    display: 'grid',
    gridTemplateColumns: 'minmax(220px, 0.9fr) minmax(320px, 1.1fr)',
    background: '#f8fbfc',
    border: '1px solid rgba(201,168,76,0.34)',
    borderRadius: '8px',
    boxShadow: '0 26px 80px rgba(0,0,0,0.38)',
  },
  modalCompact: {
    width: 'min(100%, 430px)',
    maxHeight: 'calc(100dvh - 24px)',
    gridTemplateColumns: '1fr',
  },
  brandPanel: {
    position: 'relative',
    minHeight: '520px',
    padding: '28px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    background: 'linear-gradient(150deg, #081525 0%, #0b2b3c 58%, #0f766e 100%)',
    overflow: 'hidden',
  },
  brandPanelCompact: {
    minHeight: '150px',
    padding: '12px 20px',
  },
  brandGlow: {
    position: 'absolute',
    inset: 'auto -70px -80px -70px',
    height: '230px',
    background: 'radial-gradient(circle, rgba(201,168,76,0.34), rgba(15,118,110,0.2) 38%, transparent 70%)',
    pointerEvents: 'none',
  },
  agentImage: {
    position: 'absolute',
    left: '50%',
    bottom: '-22px',
    width: 'min(174%, 640px)',
    maxHeight: '112%',
    objectFit: 'contain',
    objectPosition: 'center bottom',
    transform: 'translateX(-50%)',
    filter: 'drop-shadow(0 24px 36px rgba(0,0,0,0.35))',
    pointerEvents: 'none',
  },
  agentImageCompact: {
    width: '230px',
    left: '76%',
    bottom: '-20px',
    maxHeight: '180px',
  },
  logoRow: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 0,
    position: 'relative',
    zIndex: 2,
  },
  logo: {
    width: '132px',
    height: '132px',
    objectFit: 'contain',
    flex: '0 0 auto',
  },
  brandName: {
    color: '#f8fbfc',
    fontSize: '28px',
    fontWeight: 800,
    letterSpacing: 0,
    lineHeight: 1,
    whiteSpace: 'nowrap',
    marginLeft: '-34px',
  },
  goldText: {
    color: '#c9a84c',
  },
  colorRail: {
    display: 'flex',
    gap: '10px',
    position: 'relative',
    zIndex: 2,
  },
  railDot: {
    width: '42px',
    height: '6px',
    borderRadius: '999px',
    display: 'block',
  },
  content: {
    padding: '34px',
    color: '#081525',
  },
  contentCompact: {
    padding: '24px 20px',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '18px',
    marginBottom: '22px',
  },
  eyebrow: {
    margin: '0 0 6px',
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#0f766e',
  },
  title: {
    margin: 0,
    fontSize: 'clamp(24px, 3vw, 34px)',
    lineHeight: 1.12,
    fontWeight: 800,
    letterSpacing: 0,
  },
  subtitle: {
    margin: '10px 0 0',
    color: '#526173',
    fontSize: '14px',
    lineHeight: 1.6,
  },
  closeButton: {
    width: '36px',
    height: '36px',
    border: '1px solid rgba(8,21,37,0.12)',
    borderRadius: '999px',
    background: '#ffffff',
    color: '#081525',
    fontSize: '18px',
    lineHeight: 1,
    cursor: 'pointer',
  },
  form: {
    display: 'grid',
    gap: '14px',
  },
  field: {
    display: 'grid',
    gap: '6px',
  },
  label: {
    fontSize: '12px',
    fontWeight: 700,
    color: '#243447',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  input: {
    width: '100%',
    minHeight: '46px',
    padding: '12px 14px',
    border: '1px solid rgba(8,21,37,0.16)',
    borderRadius: '8px',
    background: '#ffffff',
    color: '#081525',
    fontSize: '16px',
  },
  select: {
    appearance: 'auto',
  },
  textarea: {
    minHeight: '112px',
    resize: 'vertical',
    lineHeight: 1.5,
  },
  optionalLabel: {
    color: '#6b7788',
    fontWeight: 500,
    textTransform: 'none',
    letterSpacing: 0,
  },
  inputError: {
    borderColor: '#f06a5b',
    boxShadow: '0 0 0 3px rgba(240,106,91,0.12)',
  },
  errorText: {
    color: '#c24135',
    fontSize: '12px',
    fontWeight: 600,
  },
  submitButton: {
    minHeight: '48px',
    marginTop: '6px',
    border: 'none',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #c9a84c 0%, #f0d58b 100%)',
    color: '#081525',
    fontWeight: 800,
    fontSize: '15px',
  },
  successBox: {
    padding: '13px 14px',
    marginBottom: '16px',
    borderRadius: '8px',
    background: 'rgba(15,118,110,0.1)',
    border: '1px solid rgba(15,118,110,0.25)',
    color: '#0f766e',
    fontSize: '14px',
    fontWeight: 700,
  },
  errorBox: {
    padding: '13px 14px',
    marginBottom: '16px',
    borderRadius: '8px',
    background: 'rgba(240,106,91,0.1)',
    border: '1px solid rgba(240,106,91,0.28)',
    color: '#b13d31',
    fontSize: '14px',
    fontWeight: 700,
  },
}
