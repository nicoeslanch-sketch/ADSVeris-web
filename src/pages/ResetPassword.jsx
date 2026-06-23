import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { sendPasswordResetConfirmationEmail } from '../lib/sendEmails'

export default function ResetPassword() {
  const [listo, setListo] = useState(false)
  const [sinToken, setSinToken] = useState(false)
  const [nueva, setNueva] = useState('')
  const [repetir, setRepetir] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState(false)

  useEffect(() => {
    const hash = window.location.hash
    if (hash.includes('type=recovery') || hash.includes('access_token')) {
      setListo(true)
    } else {
      setSinToken(true)
    }
  }, [])

  const coinciden = nueva.length >= 8 && repetir.length >= 8 && nueva === repetir
  const valido = coinciden

  async function handleSubmit(e) {
    e.preventDefault()
    if (!valido) return
    setError('')
    setLoading(true)
    try {
      const { data: { user }, error: updateError } = await supabase.auth.updateUser({ password: nueva })
      if (updateError) throw updateError

      if (user) {
        const nombre = user.user_metadata?.full_name || user.email
        await sendPasswordResetConfirmationEmail(user.email, nombre).catch(() => {})
      }

      setExito(true)
      setTimeout(() => { window.location.href = '/login' }, 2000)
    } catch (err) {
      setError(err.message || 'Error al cambiar la contraseña.')
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
          {sinToken && (
            <div style={s.sinTokenWrap}>
              <span style={s.exitoIcono}>⚠️</span>
              <h1 style={s.titulo}>Link inválido</h1>
              <p style={s.desc}>
                Este link no es válido o ha expirado. Solicita un nuevo link de recuperación.
              </p>
              <a href="/forgot-password" style={s.linkBtn}>Solicitar nuevo link</a>
            </div>
          )}

          {listo && !exito && (
            <>
              <div style={s.cardHeader}>
                <span style={s.eyebrow}>Nueva contraseña</span>
                <h1 style={s.titulo}>Cambiar tu contraseña</h1>
                <p style={s.desc}>Elige una contraseña segura de al menos 8 caracteres.</p>
              </div>

              {error && <div style={s.alertError}>{error}</div>}

              <form onSubmit={handleSubmit} noValidate style={s.form}>
                <CampoPassword
                  label="Nueva contraseña"
                  value={nueva}
                  onChange={setNueva}
                  hint={nueva.length > 0 && nueva.length < 8 ? 'Mínimo 8 caracteres' : ''}
                />
                <CampoPassword
                  label="Repetir nueva contraseña"
                  value={repetir}
                  onChange={setRepetir}
                  validacion={
                    repetir.length > 0
                      ? nueva === repetir ? 'ok' : 'error'
                      : null
                  }
                />
                <button
                  type="submit"
                  disabled={!valido || loading}
                  style={{ ...s.btn, opacity: !valido || loading ? 0.5 : 1, cursor: !valido || loading ? 'not-allowed' : 'pointer' }}
                >
                  {loading ? 'Cambiando...' : 'Cambiar contraseña'}
                </button>
              </form>
            </>
          )}

          {exito && (
            <div style={s.exitoWrap}>
              <span style={s.exitoIcono}>✅</span>
              <h1 style={s.titulo}>¡Contraseña cambiada!</h1>
              <p style={s.desc}>Redirigiendo a inicio de sesión...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function CampoPassword({ label, value, onChange, hint, validacion }) {
  return (
    <div style={s.campo}>
      <label style={s.label}>{label}</label>
      <div style={s.inputWrap}>
        <input
          type="password"
          value={value}
          onChange={e => onChange(e.target.value)}
          autoComplete="new-password"
          style={{
            ...s.input,
            ...(validacion === 'ok' ? s.inputOk : {}),
            ...(validacion === 'error' ? s.inputErr : {}),
          }}
        />
        {validacion === 'ok' && <span style={s.iconPos}>✅</span>}
        {validacion === 'error' && <span style={s.iconPos}>❌</span>}
      </div>
      {hint && <span style={s.hint}>{hint}</span>}
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
  sinTokenWrap: { textAlign: 'center' },
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
  inputWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  input: {
    width: '100%',
    padding: '12px 40px 12px 14px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '8px',
    color: '#f5f9fe',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  inputOk: { borderColor: 'rgba(22,163,74,0.6)', background: 'rgba(22,163,74,0.07)' },
  inputErr: { borderColor: 'rgba(220,38,38,0.6)', background: 'rgba(220,38,38,0.07)' },
  iconPos: { position: 'absolute', right: '12px', fontSize: '14px' },
  hint: { fontSize: '12px', color: '#f59e0b' },
  btn: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #c19a54, #e0c589)',
    color: '#09111f',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '700',
    letterSpacing: '0.02em',
    transition: 'opacity 0.2s',
  },
  linkBtn: {
    display: 'inline-block',
    marginTop: '20px',
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #c19a54, #e0c589)',
    color: '#09111f',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '700',
  },
}
