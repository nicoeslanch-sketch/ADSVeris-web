import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import AuthBrand from '../components/AuthBrand'
import { authErrorMessage } from '../lib/auth'

export default function EmailConfirmed() {
  const [verificando, setVerificando] = useState(true)
  const [confirmado, setConfirmado] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    let fallbackTimer
    const url = new URL(window.location.href)
    const hashParams = new URLSearchParams(url.hash.replace(/^#/, ''))
    const callbackError = url.searchParams.get('error_description') || hashParams.get('error_description')
    const hasCallback =
      hashParams.get('type') === 'signup' ||
      Boolean(hashParams.get('access_token')) ||
      Boolean(url.searchParams.get('code'))

    function finish(ok, message = '') {
      if (!active) return
      setConfirmado(ok)
      setError(message)
      setVerificando(false)
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session && hasCallback) finish(true)
    })

    async function verify() {
      if (callbackError) {
        finish(false, 'No pudimos confirmar el correo. El enlace puede haber expirado.')
        return
      }

      const code = url.searchParams.get('code')
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        if (exchangeError) {
          finish(false, authErrorMessage(exchangeError, 'No pudimos confirmar el correo. Solicita un enlace nuevo.'))
          return
        }
      }

      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) {
        finish(false, authErrorMessage(sessionError, 'No pudimos validar la confirmación.'))
        return
      }
      if (session && hasCallback) {
        finish(true)
        return
      }
      if (!hasCallback) {
        finish(false, 'Este enlace de confirmación no es válido o ya expiró.')
        return
      }

      fallbackTimer = window.setTimeout(async () => {
        const { data } = await supabase.auth.getSession()
        finish(Boolean(data.session), data.session ? '' : 'Este enlace de confirmación no es válido o ya expiró.')
      }, 1500)
    }

    verify()
    return () => {
      active = false
      window.clearTimeout(fallbackTimer)
      subscription.unsubscribe()
    }
  }, [])

  if (verificando) {
    return (
      <div style={s.page}>
        <div style={s.grid} aria-hidden="true" />
        <div style={s.centrado}>
          <p style={s.muted}>Verificando...</p>
        </div>
      </div>
    )
  }

  if (!confirmado) {
    return (
      <div style={s.page}>
        <div style={s.grid} aria-hidden="true" />
        <header style={s.header}><AuthBrand /></header>
        <main style={s.main}>
          <div style={s.card}>
            <span style={s.icono}>⚠️</span>
            <span style={s.eyebrow}>Confirmación pendiente</span>
            <h1 style={s.titulo}>No pudimos confirmar tu email</h1>
            <p style={s.desc} role="alert">{error}</p>
            <a href="/login" style={s.btn}>Volver a iniciar sesión</a>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div style={s.page}>
      <div style={s.grid} aria-hidden="true" />

      <header style={s.header}>
        <AuthBrand />
      </header>

      <main style={s.main}>
        <div style={s.card}>
          <span style={s.icono}>✅</span>
          <span style={s.eyebrow}>Cuenta verificada</span>
          <h1 style={s.titulo}>¡Email autenticado con éxito!</h1>
          <p style={s.desc}>
            Tu cuenta en <strong style={{ color: '#c9a84c' }}>ADS Veris</strong> ha sido confirmada correctamente.
            Ya puedes iniciar sesión y acceder a todas tus herramientas.
          </p>
          <a href="/login" style={s.btn}>Ir a iniciar sesión →</a>
        </div>
      </main>
    </div>
  )
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
  centrado: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  muted: { color: '#8ba3bc', fontSize: '15px' },
  header: {
    position: 'relative',
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    padding: '18px 40px',
    borderBottom: '1px solid rgba(247,199,95,0.1)',
    backdropFilter: 'blur(8px)',
  },
  logoWrap: { display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' },
  logoImg: { height: '34px', width: 'auto' },
  logoText: { fontSize: '17px', fontWeight: '700', color: '#f5f9fe', fontFamily: "'Sora', sans-serif" },
  logoGold: { color: '#c9a84c' },
  main: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    position: 'relative',
    zIndex: 1,
  },
  card: {
    background: 'rgba(9,28,45,0.85)',
    border: '1px solid rgba(199,168,106,0.18)',
    borderRadius: '16px',
    padding: '52px 44px',
    backdropFilter: 'blur(14px)',
    boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
    width: '100%',
    maxWidth: '460px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  icono: { fontSize: '52px', display: 'block', marginBottom: '4px' },
  eyebrow: {
    fontSize: '12px',
    fontWeight: '700',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#c9a84c',
  },
  titulo: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#f5f9fe',
    margin: '4px 0',
    fontFamily: "'Sora', sans-serif",
    lineHeight: '1.3',
  },
  desc: {
    fontSize: '15px',
    color: '#8ba3bc',
    lineHeight: '1.7',
    margin: '4px 0 12px 0',
  },
  btn: {
    display: 'inline-block',
    padding: '14px 32px',
    background: 'linear-gradient(135deg, #c19a54, #e0c589)',
    color: '#09111f',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: '700',
    letterSpacing: '0.02em',
  },
}
