import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!email.trim()) {
      setError('Ingresa tu email.')
      return
    }
    setLoading(true)
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: 'https://pymex-web.vercel.app/reset-password',
      })
      if (err) throw err
      setExito(true)
    } catch (err) {
      setError(err.message || 'Error al enviar el email. Verifica que el email sea correcto.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.grid} aria-hidden="true" />

      <header style={s.header}>
        <a href="/" style={s.logoWrap}>
          <img src="/images/logo-ads-veris.png" alt="ADS Veris" style={s.logoImg} />
          <span style={s.logoText}>ADS <span style={s.logoGold}>Veris</span></span>
        </a>
      </header>

      <main style={s.main}>
        <div style={s.card}>
          {exito ? (
            <div style={s.exitoWrap}>
              <span style={s.exitoIcono}>📧</span>
              <h1 style={s.titulo}>¡Email enviado!</h1>
              <p style={s.desc}>
                Revisa tu email. Hemos enviado un link para cambiar tu contraseña a <strong>{email}</strong>.
              </p>
              <p style={s.desc}>Si no lo ves, revisa tu carpeta de spam.</p>
              <a href="/login" style={s.linkVolver}>← Volver a iniciar sesión</a>
            </div>
          ) : (
            <>
              <div style={s.cardHeader}>
                <span style={s.eyebrow}>Recuperar acceso</span>
                <h1 style={s.titulo}>¿Olvidaste tu contraseña?</h1>
                <p style={s.desc}>
                  Ingresa tu email y te enviaremos un link para restablecer tu contraseña.
                </p>
              </div>

              {error && <div style={s.alertError}>{error}</div>}

              <form onSubmit={handleSubmit} noValidate style={s.form}>
                <div style={s.campo}>
                  <label style={s.label}>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError('') }}
                    placeholder="tu@email.com"
                    style={s.input}
                    autoComplete="email"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  style={{ ...s.btn, opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? 'Enviando...' : 'Enviar link de reset'}
                </button>
              </form>

              <div style={s.footer}>
                <a href="/login" style={s.linkMuted}>← Volver a iniciar sesión</a>
              </div>
            </>
          )}
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
    padding: '44px 40px',
    backdropFilter: 'blur(14px)',
    boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
    width: '100%',
    maxWidth: '420px',
  },
  exitoWrap: { textAlign: 'center' },
  exitoIcono: { fontSize: '48px', display: 'block', marginBottom: '16px' },
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
    fontSize: '24px',
    fontWeight: '800',
    color: '#f5f9fe',
    marginBottom: '10px',
    fontFamily: "'Sora', sans-serif",
  },
  desc: { fontSize: '14px', color: '#8ba3bc', lineHeight: '1.6', marginBottom: '8px' },
  alertError: {
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: '8px',
    padding: '12px 14px',
    marginBottom: '20px',
    fontSize: '13px',
    color: '#fca5a5',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '18px' },
  campo: { display: 'flex', flexDirection: 'column', gap: '7px' },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#ccd8ea',
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
    width: '100%',
    boxSizing: 'border-box',
  },
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
    letterSpacing: '0.02em',
  },
  footer: {
    marginTop: '24px',
    paddingTop: '20px',
    borderTop: '1px solid rgba(199,168,106,0.12)',
  },
  linkMuted: { fontSize: '13px', color: '#8ba3bc', textDecoration: 'none' },
  linkVolver: {
    display: 'inline-block',
    marginTop: '20px',
    fontSize: '13px',
    color: '#c9a84c',
    textDecoration: 'none',
    fontWeight: '600',
  },
}
