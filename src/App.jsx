import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import RegisterForm from './components/RegisterForm'
import Login from './pages/Login'
import Profile from './pages/Profile'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import EmailConfirmed from './pages/EmailConfirmed'
import KommoContactForm from './components/KommoContactForm'

const WHATSAPP_URL = 'https://wa.me/56948217345?text=Hola%20ADS%20Veris%2C%20quiero%20hacer%20una%20consulta.'

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
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/email-confirmed" element={<EmailConfirmed />} />
        <Route path="/contacto-kommo" element={<KommoContactForm />} />
        <Route path="/dashboard" element={<Navigate to="/profile" replace />} />
        <Route path="/" element={<RootHandler />} />
      </Routes>
      <FloatingWhatsapp />
    </BrowserRouter>
  )
}

export default App
