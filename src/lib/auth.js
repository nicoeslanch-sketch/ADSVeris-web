const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function normalizeEmail(value = '') {
  return value.trim().toLowerCase()
}

export function isValidEmail(value = '') {
  return EMAIL_RE.test(normalizeEmail(value))
}

export function getAuthRedirectUrl(path) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const configuredOrigin = import.meta.env.VITE_SITE_URL?.trim()

  if (configuredOrigin) {
    return new URL(normalizedPath, ensureTrailingSlash(configuredOrigin)).toString()
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return new URL(normalizedPath, window.location.origin).toString()
  }

  return normalizedPath
}

export function isEmailNotConfirmed(error) {
  const code = String(error?.code || '').toLowerCase()
  const message = String(error?.message || '').toLowerCase()
  return code === 'email_not_confirmed' || message.includes('email not confirmed')
}

export function authErrorMessage(error, fallback = 'No pudimos completar la solicitud. Intenta nuevamente.') {
  const code = String(error?.code || '').toLowerCase()
  const message = String(error?.message || '').toLowerCase()
  const status = Number(error?.status || 0)

  if (
    message.includes('failed to fetch') ||
    message.includes('network') ||
    message.includes('load failed') ||
    code === 'fetch_error'
  ) {
    return 'No pudimos conectar con el servicio de cuentas. Intenta nuevamente en unos minutos.'
  }
  if (isEmailNotConfirmed(error)) {
    return 'Debes confirmar tu correo antes de iniciar sesión.'
  }
  if (code === 'invalid_credentials' || message.includes('invalid login credentials')) {
    return 'El email o la contraseña no son correctos.'
  }
  if (code === 'user_already_exists' || message.includes('already registered')) {
    return 'Ya existe una cuenta asociada a este email. Intenta iniciar sesión.'
  }
  if (status === 429 || code.includes('rate_limit') || message.includes('rate limit')) {
    return 'Demasiados intentos. Espera unos minutos e intenta nuevamente.'
  }
  if (status === 422 || code === 'weak_password' || message.includes('password')) {
    return 'La contraseña no cumple los requisitos de seguridad.'
  }
  if (code === 'otp_expired' || message.includes('expired')) {
    return 'El enlace expiró. Solicita uno nuevo.'
  }

  return fallback
}

export function safeStorageGet(key) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export function safeStorageSet(key, value) {
  try {
    localStorage.setItem(key, value)
    return true
  } catch {
    return false
  }
}

function ensureTrailingSlash(value) {
  return value.endsWith('/') ? value : `${value}/`
}
