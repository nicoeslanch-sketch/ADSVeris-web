import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { sendPasswordChangedEmail } from '../lib/sendEmails'

function serviciosFromPlan(planId) {
  const base = { planillasCompradas: 0, paginaWeb: null, procesos: false, analisis: false, plataforma: null, planBundle: null }
  const mapa = {
    free: base,
    basico: { ...base, planillas: 2, paginaWeb: 'esencial', plataforma: 'basico' },
    optimo: { planillasCompradas: 0, paginaWeb: 'profesional', procesos: true, analisis: false, plataforma: 'basico', planBundle: 'optimo' },
    premium: { planillasCompradas: 0, paginaWeb: 'empresa', procesos: true, analisis: true, plataforma: 'basico', planBundle: 'premium' },
  }
  return mapa[planId] || base
}

export default function Profile() {
  const [usuario, setUsuario] = useState(null)
  const [metadata, setMetadata] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    async function cargar() {
      try {
        const { data: { session }, error: sErr } = await supabase.auth.getSession()
        if (sErr) throw sErr
        if (!session) { window.location.href = '/login'; return }

        setUsuario(session.user)

        const authMetadata = metadataFromAuth(session.user)
        const localMetadata = metadataFromLocal(session.user.email)
        const { data, error: mErr } = await supabase
          .from('users_metadata')
          .select('*')
          .eq('user_id', session.user.id)
          .single()

        const perfil = mergeMetadata(authMetadata, data, localMetadata)
        setMetadata(perfil)

        const nombre = perfil.full_name || session.user.email
        localStorage.setItem('adsveris_user', JSON.stringify({
          name: nombre,
          email: session.user.email,
          initial: nombre[0].toUpperCase(),
        }))
      } catch (err) {
        setError(err.message || 'Error al cargar el perfil.')
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [])

  async function cerrarSesion() {
    localStorage.removeItem('adsveris_user')
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  if (loading) return <div style={s.centrado}><p style={s.gris}>Cargando perfil...</p></div>
  if (error) return <div style={s.centrado}><p style={s.rojo}>{error}</p></div>

  const serv = serviciosFromPlan(metadata?.plan_id)
  const nombre = metadata?.full_name || usuario?.email

  return (
    <div style={s.pagina}>
      <header style={s.header}>
        <a href="/" style={s.logo}>
          <strong>ADS</strong> <span style={s.logoVeris}>Veris</span>
        </a>
        <div style={s.headerRight}>
          <span style={s.headerNombre}>{nombre}</span>
          <button onClick={cerrarSesion} style={s.btnLogout}>Cerrar sesión</button>
        </div>
      </header>

      <main style={s.main}>
        <h1 style={s.titulo}>Mi perfil</h1>

        {/* Datos personales */}
        <section style={s.seccion}>
          <h2 style={s.subtitulo}>Datos de la cuenta</h2>
          <div style={s.tarjeta}>
            <Fila label="Nombre completo" valor={metadata?.full_name} />
            <Fila label="Email" valor={usuario?.email} />
            <Fila label="Teléfono" valor={metadata?.phone} />
            <Fila label="RUT" valor={metadata?.rut} />
            <Fila label="Plan" valor={metadata?.plan_id === 'free' ? 'Gratuito' : metadata?.plan_id} badge />
          </div>
          <button style={s.btnContrasena} onClick={() => setModalOpen(true)}>
            Cambiar contraseña
          </button>
        </section>

        {/* Servicios */}
        <section style={s.seccion}>
          <h2 style={s.subtitulo}>Mis servicios y planes</h2>
          <div style={s.grid}>

            <TarjetaServ icono="📊" titulo="Planillas">
              <p style={s.servLabel}>Planillas compradas</p>
              <p style={s.servNumero}>{serv.planillasCompradas}</p>
            </TarjetaServ>

            <TarjetaServ icono="🌐" titulo="Páginas web">
              <p style={s.servLabel}>Plan contratado</p>
              <BadgePlan plan={serv.paginaWeb} mapeo={{ esencial: 'Plan Esencial', profesional: 'Plan Profesional', empresa: 'Plan Empresa' }} />
            </TarjetaServ>

            <TarjetaServ icono="⚙️" titulo="Procesos">
              <p style={s.servLabel}>Servicio de optimización y mejora de procesos</p>
              <BadgeToggle activo={serv.procesos} />
            </TarjetaServ>

            <TarjetaServ icono="🔍" titulo="Limpieza y análisis de datos">
              <p style={s.servLabel}>Estado del servicio</p>
              <BadgeToggle activo={serv.analisis} />
            </TarjetaServ>

            <TarjetaServ icono="🖥️" titulo="Plataforma">
              <p style={s.servLabel}>Plan de plataforma</p>
              <BadgePlan plan={serv.plataforma} mapeo={{ basico: 'Plan Básico' }} />
            </TarjetaServ>

            <TarjetaServ icono="⭐" titulo="Plan General / Óptimo / Premium" destacado>
              <p style={s.servLabel}>Plan bundle activo</p>
              <BadgePlan plan={serv.planBundle} mapeo={{ general: 'Plan General', optimo: 'Plan Óptimo', premium: 'Plan Premium' }} />
              {serv.planBundle && (
                <ul style={s.bundleList}>
                  <li>✅ Todas las planillas incluidas</li>
                  <li>✅ Servicio web completamente desbloqueado</li>
                  <li>✅ Procesos siempre activo</li>
                  <li>✅ Acceso a plataforma — plan básico</li>
                </ul>
              )}
            </TarjetaServ>

          </div>
        </section>
      </main>

      {modalOpen && (
        <ModalCambiarContrasena
          usuario={usuario}
          metadata={metadata}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  )
}

function ModalCambiarContrasena({ usuario, metadata, onClose }) {
  const [actual, setActual] = useState('')
  const [nueva, setNueva] = useState('')
  const [repetir, setRepetir] = useState('')
  const [loadingM, setLoadingM] = useState(false)
  const [errorM, setErrorM] = useState('')
  const [exito, setExito] = useState(false)

  const coinciden = nueva.length >= 8 && repetir.length >= 8 && nueva === repetir
  const valido = actual.length > 0 && coinciden

  async function handleCambiar(e) {
    e.preventDefault()
    if (!valido) return
    setErrorM('')
    setLoadingM(true)
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: usuario.email,
        password: actual,
      })
      if (authError) throw new Error('La contraseña actual es incorrecta.')

      const { error: updateError } = await supabase.auth.updateUser({ password: nueva })
      if (updateError) throw updateError

      const nombre = metadata?.full_name || usuario.email
      await sendPasswordChangedEmail(usuario.email, nombre).catch(() => {})

      setExito(true)
      setTimeout(onClose, 2000)
    } catch (err) {
      setErrorM(err.message || 'Error al cambiar la contraseña.')
    } finally {
      setLoadingM(false)
    }
  }

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>
        <div style={s.modalHeader}>
          <h2 style={s.modalTitulo}>Cambiar contraseña</h2>
          <button style={s.btnCerrar} onClick={onClose}>✕</button>
        </div>

        {exito ? (
          <div style={s.exitoBox}>
            <p style={s.exitoTexto}>✅ Contraseña cambiada exitosamente</p>
          </div>
        ) : (
          <form onSubmit={handleCambiar} style={s.modalForm}>
            {errorM && <div style={s.errorBox}>{errorM}</div>}

            <CampoPassword
              label="Contraseña actual"
              value={actual}
              onChange={setActual}
              autoComplete="current-password"
            />
            <CampoPassword
              label="Nueva contraseña"
              value={nueva}
              onChange={setNueva}
              autoComplete="new-password"
              hint={nueva.length > 0 && nueva.length < 8 ? 'Mínimo 8 caracteres' : ''}
            />
            <CampoPassword
              label="Repetir nueva contraseña"
              value={repetir}
              onChange={setRepetir}
              autoComplete="new-password"
              validacion={
                repetir.length > 0
                  ? nueva === repetir
                    ? 'ok'
                    : 'error'
                  : null
              }
            />

            <button
              type="submit"
              disabled={!valido || loadingM}
              style={{ ...s.btnGuardar, opacity: !valido || loadingM ? 0.5 : 1, cursor: !valido || loadingM ? 'not-allowed' : 'pointer' }}
            >
              {loadingM ? 'Cambiando...' : 'Cambiar contraseña'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

function CampoPassword({ label, value, onChange, autoComplete, hint, validacion }) {
  return (
    <div style={s.campoWrap}>
      <label style={s.campoLabel}>{label}</label>
      <div style={s.inputWrap}>
        <input
          type="password"
          value={value}
          onChange={e => onChange(e.target.value)}
          autoComplete={autoComplete}
          style={{
            ...s.campoInput,
            ...(validacion === 'ok' ? s.inputOk : {}),
            ...(validacion === 'error' ? s.inputErr : {}),
          }}
        />
        {validacion === 'ok' && <span style={s.iconOk}>✅</span>}
        {validacion === 'error' && <span style={s.iconErr}>❌</span>}
      </div>
      {hint && <span style={s.hint}>{hint}</span>}
    </div>
  )
}

function metadataFromAuth(user) {
  const data = user?.user_metadata || {}
  return {
    full_name: firstValue(data.full_name, data.name, user?.email),
    rut: firstValue(data.rut),
    phone: firstValue(data.phone, data.telefono, data.phone_number),
    plan_id: firstValue(data.plan_id, 'free'),
  }
}

function metadataFromLocal(email) {
  try {
    return JSON.parse(localStorage.getItem(`adsveris_profile:${email?.trim().toLowerCase()}`)) || {}
  } catch {
    return {}
  }
}

function mergeMetadata(...sources) {
  return {
    full_name: firstValue(...sources.map(source => source?.full_name), ...sources.map(source => source?.name)),
    rut: firstValue(...sources.map(source => source?.rut)),
    phone: firstValue(...sources.map(source => source?.phone), ...sources.map(source => source?.telefono), ...sources.map(source => source?.phone_number)),
    plan_id: firstValue(...sources.map(source => source?.plan_id), 'free'),
  }
}

function firstValue(...values) {
  return values.find(value => value !== undefined && value !== null && String(value).trim() !== '') || ''
}

function Fila({ label, valor, badge }) {
  return (
    <div style={s.fila}>
      <span style={s.filaLabel}>{label}</span>
      {badge
        ? <span style={s.badgePlan}>{valor || '—'}</span>
        : <span style={s.filaValor}>{valor || '—'}</span>
      }
    </div>
  )
}

function TarjetaServ({ icono, titulo, children, destacado }) {
  return (
    <div style={{ ...s.tarjetaServ, ...(destacado ? s.tarjetaDestacada : {}) }}>
      <div style={s.servHeader}>
        <span style={s.icono}>{icono}</span>
        <h3 style={s.servTitulo}>{titulo}</h3>
      </div>
      {children}
    </div>
  )
}

function BadgePlan({ plan, mapeo }) {
  if (!plan) return <span style={s.badgeSinPlan}>Sin plan</span>
  return <span style={s.badgePlanActivo}>{mapeo[plan] || plan}</span>
}

function BadgeToggle({ activo }) {
  return (
    <span style={activo ? s.badgeActivo : s.badgeDesactivado}>
      {activo ? '● Activado' : '● Desactivado'}
    </span>
  )
}

const s = {
  pagina: { minHeight: '100vh', backgroundColor: '#f5f5f5' },
  centrado: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  gris: { color: '#6b7280', fontSize: '16px' },
  rojo: { color: '#ef4444', fontSize: '15px' },

  header: {
    backgroundColor: '#09111f',
    borderBottom: '1px solid rgba(247,199,95,0.12)',
    padding: '14px 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: { color: '#fff', textDecoration: 'none', fontSize: '17px', fontWeight: '700' },
  logoVeris: { color: '#c9a84c' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '14px' },
  headerNombre: { color: 'rgba(255,255,255,0.65)', fontSize: '14px' },
  btnLogout: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    color: '#ef4444',
    border: '1px solid rgba(239,68,68,0.35)',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },

  main: { maxWidth: '860px', margin: '0 auto', padding: '36px 20px' },
  titulo: { fontSize: '26px', fontWeight: '700', color: '#111', marginBottom: '28px' },

  seccion: { marginBottom: '44px' },
  subtitulo: { fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' },

  tarjeta: {
    backgroundColor: '#fff',
    borderRadius: '10px',
    padding: '4px 24px',
    boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
    marginBottom: '14px',
  },
  fila: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 0',
    borderBottom: '1px solid #f3f4f6',
  },
  filaLabel: { fontSize: '14px', color: '#6b7280', fontWeight: '500' },
  filaValor: { fontSize: '14px', color: '#111' },

  badgePlan: {
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    padding: '3px 12px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  btnContrasena: {
    padding: '10px 20px',
    backgroundColor: '#09111f',
    color: '#fff',
    border: '1px solid rgba(201,168,76,0.3)',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontWeight: '500',
  },

  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modal: {
    background: '#fff',
    borderRadius: '12px',
    padding: '32px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  modalTitulo: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '700',
    color: '#111',
  },
  btnCerrar: {
    background: 'none',
    border: 'none',
    fontSize: '16px',
    color: '#6b7280',
    cursor: 'pointer',
    padding: '4px',
    lineHeight: 1,
  },
  modalForm: { display: 'flex', flexDirection: 'column', gap: '16px' },
  errorBox: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '12px 14px',
    fontSize: '13px',
    color: '#dc2626',
  },
  exitoBox: {
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '8px',
    padding: '20px',
    textAlign: 'center',
  },
  exitoTexto: { margin: 0, fontSize: '15px', color: '#16a34a', fontWeight: '600' },
  campoWrap: { display: 'flex', flexDirection: 'column', gap: '6px' },
  campoLabel: { fontSize: '13px', fontWeight: '600', color: '#374151' },
  inputWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  campoInput: {
    width: '100%',
    padding: '11px 40px 11px 14px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '15px',
    color: '#111',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  inputOk: { borderColor: '#16a34a', background: '#f0fdf4' },
  inputErr: { borderColor: '#dc2626', background: '#fef2f2' },
  iconOk: { position: 'absolute', right: '12px', fontSize: '14px' },
  iconErr: { position: 'absolute', right: '12px', fontSize: '14px' },
  hint: { fontSize: '12px', color: '#f59e0b' },
  btnGuardar: {
    padding: '13px',
    background: 'linear-gradient(135deg,#c19a54,#e0c589)',
    color: '#09111f',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '700',
    fontFamily: 'inherit',
    marginTop: '4px',
    transition: 'opacity 0.2s',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '16px',
  },

  tarjetaServ: {
    backgroundColor: '#fff',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
  },
  tarjetaDestacada: {
    border: '1px solid rgba(193,154,84,0.35)',
    background: 'linear-gradient(135deg, #fffbf2 0%, #fff 100%)',
  },

  servHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' },
  icono: { fontSize: '22px', flexShrink: 0 },
  servTitulo: { fontSize: '14px', fontWeight: '600', color: '#111', margin: 0 },
  servLabel: { fontSize: '12px', color: '#6b7280', margin: '0 0 8px 0' },
  servNumero: { fontSize: '28px', fontWeight: '700', color: '#111', margin: 0 },

  badgePlanActivo: {
    display: 'inline-block',
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    padding: '4px 14px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
  },
  badgeSinPlan: {
    display: 'inline-block',
    backgroundColor: '#f3f4f6',
    color: '#9ca3af',
    padding: '4px 14px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '500',
  },
  badgeActivo: {
    display: 'inline-block',
    backgroundColor: '#f0fdf4',
    color: '#16a34a',
    padding: '4px 14px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
  },
  badgeDesactivado: {
    display: 'inline-block',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    padding: '4px 14px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
  },

  bundleList: {
    margin: '12px 0 0 0',
    padding: '0',
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    fontSize: '12px',
    color: '#374151',
  },
}
