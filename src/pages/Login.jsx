import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import saludandoImg from '../../assets/images/saludando.png'
import seguridadImg from '../../assets/images/seguridad.png'

const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000

export default function Login() {
  const isMobile = useIsMobile()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [loading, setLoading] = useState(false)
  const intentos = useRef(0)
  const ventanaInicio = useRef(Date.now())

  function validar() {
    const e = {}
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Ingresa un email válido'
    if (!password) e.password = 'La contraseña es obligatoria'
    return e
  }

  function verificarRateLimit() {
    const ahora = Date.now()
    if (ahora - ventanaInicio.current > RATE_LIMIT_WINDOW_MS) {
      intentos.current = 0
      ventanaInicio.current = ahora
    }
    if (intentos.current >= RATE_LIMIT_MAX) {
      const min = Math.ceil((RATE_LIMIT_WINDOW_MS - (ahora - ventanaInicio.current)) / 60000)
      return `Demasiados intentos. Intenta en ${min} minuto${min !== 1 ? 's' : ''}.`
    }
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErrorGeneral('')
    const ev = validar()
    if (Object.keys(ev).length > 0) { setErrores(ev); return }
    const rl = verificarRateLimit()
    if (rl) { setErrorGeneral(rl); return }

    setLoading(true)
    intentos.current += 1
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      const inicial = (data.user.email || '?')[0].toUpperCase()
      localStorage.setItem('adsveris_user', JSON.stringify({
        name: data.user.email,
        email: data.user.email,
        initial: inicial,
      }))
      window.location.href = '/'
    } catch (err) {
      setErrorGeneral(err.message || 'Email o contraseña incorrectos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={sx(s.page, isMobile && s.pageMobile)}>
      {/* Grid overlay */}
      <div style={s.grid} aria-hidden="true" />

      {/* Header */}
      <header style={sx(s.header, isMobile && s.headerMobile)}>
        <a href="/" style={s.logoWrap}>
          <img src="/images/logo-ads-veris.png" alt="ADS Veris" style={s.logoImg} />
          <span style={s.logoText}>ADS <span style={s.logoGold}>Veris</span></span>
        </a>
        <a href="/register" style={sx(s.headerLink, isMobile && s.headerLinkMobile)}>¿No tienes cuenta? <span style={s.headerLinkGold}>Regístrate</span></a>
      </header>

      {/* Main split */}
      <main style={sx(s.main, isMobile && s.mainMobile)}>

        {/* Imagen izquierda */}
        <div style={sx(s.sideCol, isMobile && s.sideColMobile, isMobile && s.leftVisualMobile)}>
          <img
            src={saludandoImg}
            alt="Bienvenida a ADS Veris"
            style={sx(s.heroImg, isMobile && s.heroImgMobile)}
          />
        </div>

        {/* Formulario centro */}
        <div style={sx(s.formCol, isMobile && s.formColMobile)}>
          <div style={sx(s.card, isMobile && s.cardMobile)}>
            <div style={s.cardHeader}>
              <span style={s.eyebrow}>Bienvenido de vuelta</span>
              <h1 style={s.titulo}>Iniciar sesión</h1>
              <p style={s.subtitulo}>Accede a tus herramientas y planes ADS Veris.</p>
            </div>

            {errorGeneral && <div style={s.alertError}>{errorGeneral}</div>}

            <form onSubmit={handleSubmit} noValidate style={s.form}>
              <Campo
                label="Email"
                type="email"
                value={email}
                onChange={v => { setEmail(v); setErrores(p => ({ ...p, email: '' })) }}
                error={errores.email}
                placeholder="tu@email.com"
              />
              <Campo
                label="Contraseña"
                type="password"
                value={password}
                onChange={v => { setPassword(v); setErrores(p => ({ ...p, password: '' })) }}
                error={errores.password}
                placeholder="Tu contraseña"
              />

              <button type="submit" disabled={loading} style={{ ...s.btn, opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Ingresando...' : 'Iniciar sesión'}
              </button>
            </form>

            <div style={sx(s.cardFooter, isMobile && s.cardFooterMobile)}>
              <a href="/forgot-password" style={s.linkMuted}>¿Olvidaste tu contraseña?</a>
              <a href="/register" style={s.linkGold}>Crear cuenta gratis →</a>
            </div>
          </div>
        </div>

        {/* Imagen derecha */}
        <div style={sx(s.sideCol, isMobile && s.sideColMobile, isMobile && s.rightVisualMobile)}>
          <img
            src={seguridadImg}
            alt="Seguridad de cuenta ADS Veris"
            style={sx(s.securityImg, isMobile && s.securityImgMobile)}
          />
        </div>

      </main>
    </div>
  )
}

function Campo({ label, type = 'text', value, onChange, error, placeholder }) {
  return (
    <div style={s.campo}>
      <label style={s.label}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ ...s.input, ...(error ? s.inputError : {}) }}
        autoComplete={type === 'email' ? 'email' : 'current-password'}
      />
      {error && <span style={s.errorMsg}>{error}</span>}
    </div>
  )
}

function useIsMobile(maxWidth = 780) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth <= maxWidth
  })

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= maxWidth)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [maxWidth])

  return isMobile
}

function sx(...styles) {
  return Object.assign({}, ...styles.filter(Boolean))
}

const s = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(160deg, #0d2235 0%, #1a3a52 55%, #0f2a3f 100%)',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
  },
  pageMobile: {
    overflowX: 'hidden',
    overflowY: 'auto',
  },
  grid: {
    position: 'fixed',
    inset: 0,
    pointerEvents: 'none',
    background: `
      linear-gradient(rgba(108,141,168,0.07) 1px, transparent 1px),
      linear-gradient(90deg, rgba(108,141,168,0.07) 1px, transparent 1px)
    `,
    backgroundSize: '48px 48px',
    zIndex: 0,
  },
  header: {
    position: 'relative',
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '18px 40px',
    borderBottom: '1px solid rgba(247,199,95,0.1)',
    backdropFilter: 'blur(8px)',
  },
  headerMobile: {
    padding: '16px 18px',
    gap: '16px',
  },
  logoWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
  },
  logoImg: { height: '34px', width: 'auto' },
  logoText: { fontSize: '17px', fontWeight: '700', color: '#f5f9fe', fontFamily: "'Sora', sans-serif" },
  logoGold: { color: '#c9a84c' },
  headerLink: { fontSize: '14px', color: '#ccd8ea' },
  headerLinkMobile: { fontSize: '13px', lineHeight: '1.3', textAlign: 'right' },
  headerLinkGold: { color: '#c9a84c', fontWeight: '600' },

  main: {
    flex: 1,
    display: 'grid',
    gridTemplateColumns: 'minmax(220px, 1fr) minmax(380px, 420px) minmax(220px, 1fr)',
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
    padding: '40px',
    gap: '30px',
    maxWidth: '1360px',
    margin: '0 auto',
    width: '100%',
  },
  mainMobile: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    padding: '24px 16px 36px',
    gap: '18px',
    maxWidth: '520px',
    overflow: 'visible',
  },

  sideCol: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minWidth: 0,
    minHeight: '580px',
  },
  sideColMobile: {
    minHeight: 'auto',
    width: '100%',
  },
  leftVisualMobile: { order: 2 },
  rightVisualMobile: { order: 3 },
  heroImg: {
    width: 'clamp(370px, 35vw, 580px)',
    maxWidth: '132%',
    height: 'auto',
    objectFit: 'contain',
    position: 'relative',
    filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.4))',
  },
  heroImgMobile: {
    width: 'min(70vw, 250px)',
    maxWidth: '100%',
  },
  securityImg: {
    width: 'clamp(260px, 27vw, 410px)',
    maxWidth: '112%',
    height: 'auto',
    objectFit: 'contain',
    position: 'relative',
    filter: 'drop-shadow(0 18px 34px rgba(0,0,0,0.32))',
  },
  securityImgMobile: {
    width: 'min(72vw, 250px)',
    maxWidth: '100%',
  },

  formCol: {
    width: '420px',
    flexShrink: 0,
  },
  formColMobile: {
    order: 1,
    width: '100%',
    flexShrink: 1,
  },
  card: {
    background: 'rgba(9,28,45,0.85)',
    border: '1px solid rgba(199,168,106,0.18)',
    borderRadius: '16px',
    padding: '44px 40px',
    backdropFilter: 'blur(14px)',
    boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
  },
  cardMobile: {
    width: '100%',
    padding: '30px 22px',
    borderRadius: '14px',
  },
  cardHeader: { marginBottom: '28px' },
  eyebrow: {
    fontSize: '12px',
    fontWeight: '700',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#c9a84c',
    display: 'block',
    marginBottom: '8px',
  },
  titulo: {
    fontSize: '26px',
    fontWeight: '800',
    color: '#f5f9fe',
    marginBottom: '8px',
    fontFamily: "'Sora', sans-serif",
  },
  subtitulo: { fontSize: '14px', color: '#8ba3bc', lineHeight: '1.5' },

  alertError: {
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: '8px',
    padding: '12px 14px',
    marginBottom: '20px',
    fontSize: '13px',
    color: '#fca5a5',
  },

  form: { display: 'flex', flexDirection: 'column', gap: '0px' },

  campo: { display: 'flex', flexDirection: 'column', marginBottom: '18px' },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#ccd8ea',
    marginBottom: '7px',
    letterSpacing: '0.02em',
  },
  input: {
    padding: '12px 14px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '8px',
    color: '#f5f9fe',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.2s',
    width: '100%',
  },
  inputError: { borderColor: 'rgba(239,68,68,0.6)' },
  errorMsg: { color: '#fca5a5', fontSize: '12px', marginTop: '5px' },

  btn: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #c19a54, #e0c589)',
    color: '#09111f',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '8px',
    letterSpacing: '0.02em',
    transition: 'opacity 0.2s',
  },

  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '24px',
    paddingTop: '20px',
    borderTop: '1px solid rgba(199,168,106,0.12)',
  },
  cardFooterMobile: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '10px',
  },
  linkMuted: { fontSize: '13px', color: '#8ba3bc' },
  linkGold: { fontSize: '13px', color: '#c9a84c', fontWeight: '600' },
}
