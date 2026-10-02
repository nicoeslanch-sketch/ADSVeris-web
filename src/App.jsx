import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import '../site-config.js'
import RegisterForm from './components/RegisterForm'
import Login from './pages/Login'
import Profile from './pages/Profile'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import EmailConfirmed from './pages/EmailConfirmed'
import KommoContactForm from './components/KommoContactForm'
import { DOWNLOAD_PRODUCTS } from '../shared/download-products.js'

const WHATSAPP_URL = 'https://wa.me/56983894129?text=Hola%20ADS%20Veris%2C%20quiero%20hacer%20una%20consulta.'
const PUBLIC_AUTH_ENABLED = window.ADS_VERIS_CONFIG?.publicAuthEnabled === true

function PublicSiteRedirect() {
  useEffect(() => {
    window.location.replace('/index.html')
  }, [])

  return null
}

function PublicAuthRoute({ children }) {
  return PUBLIC_AUTH_ENABLED ? children : <PublicSiteRedirect />
}

function FloatingWhatsapp() {
  return (
    <a
      className="app-floating-whatsapp"
      href={WHATSAPP_URL}
      target="_blank"
      rel="noreferrer"
      aria-label="Escribir a ADS Veris por WhatsApp"
      title="Escribir por WhatsApp"
    >
      <img src="/images/wasap_boton.png" alt="" />
    </a>
  )
}

function RootHandler() {
  if (!PUBLIC_AUTH_ENABLED) return <PublicSiteRedirect />

  const hash = window.location.hash
  if (hash.includes('type=signup')) {
    return <Navigate to={'/email-confirmed' + hash} replace />
  }
  if (hash.includes('type=recovery')) {
    return <Navigate to={'/reset-password' + hash} replace />
  }
  return <Navigate to="/register" replace />
}

function App() {
  const requestedSlug = new URLSearchParams(window.location.search).get('planilla')
  const requestedProduct = Object.hasOwn(DOWNLOAD_PRODUCTS, requestedSlug || '') ? { slug: requestedSlug, title: DOWNLOAD_PRODUCTS[requestedSlug].title } : null
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<PublicAuthRoute><RegisterForm /></PublicAuthRoute>} />
        <Route path="/login" element={<PublicAuthRoute><Login /></PublicAuthRoute>} />
        <Route path="/profile" element={<PublicAuthRoute><Profile /></PublicAuthRoute>} />
        <Route path="/forgot-password" element={<PublicAuthRoute><ForgotPassword /></PublicAuthRoute>} />
        <Route path="/reset-password" element={<PublicAuthRoute><ResetPassword /></PublicAuthRoute>} />
        <Route path="/email-confirmed" element={<PublicAuthRoute><EmailConfirmed /></PublicAuthRoute>} />
        <Route path="/contacto-kommo" element={<KommoContactForm downloadProduct={requestedProduct} defaultService={requestedProduct ? 'Descarga de planilla gratuita' : new URLSearchParams(window.location.search).get('servicio') || undefined} />} />
        <Route path="/dashboard" element={<PublicAuthRoute><Navigate to="/profile" replace /></PublicAuthRoute>} />
        <Route path="/" element={<RootHandler />} />
      </Routes>
      <FloatingWhatsapp />
    </BrowserRouter>
  )
}

export default App
