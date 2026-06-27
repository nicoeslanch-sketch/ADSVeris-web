import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import RegisterForm from './components/RegisterForm'
import Login from './pages/Login'
import Profile from './pages/Profile'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import EmailConfirmed from './pages/EmailConfirmed'

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
        <Route path="/dashboard" element={<Navigate to="/profile" replace />} />
        <Route path="/" element={<RootHandler />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
