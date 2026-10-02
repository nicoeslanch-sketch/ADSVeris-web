// No automatic retries: a lost response does not prove that Kommo rejected a POST.
export async function submitContactForm(payload, { fetchImpl = fetch, timeoutMs = 55000 } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetchImpl('/api/submit-kommo', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      signal: controller.signal, body: JSON.stringify(payload),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok || data?.success !== true) {
      throw new Error(typeof data?.error === 'string' ? data.error : 'No pudimos confirmar la recepción. Consulta a servicios@adsveris.com antes de reenviar.')
    }
    const downloadUrl = typeof data.downloadUrl === 'string' && /^\/api\/download-planilla\?ticket=[a-zA-Z0-9_.-]+$/.test(data.downloadUrl) ? data.downloadUrl : ''
    if (payload.downloadSlug && !downloadUrl && data.pending !== true) {
      throw new Error('No pudimos confirmar la descarga. Consulta a servicios@adsveris.com antes de reenviar tus datos.')
    }
    return {
      downloadUrl,
      message: typeof data.message === 'string' && data.message ? data.message : data.pending === true
        ? 'Recibimos tu solicitud. La confirmación automática está pendiente; no necesitas enviarla de nuevo.'
        : downloadUrl
          ? 'Gracias. Ya puedes descargar el archivo gratuito. Te contactaremos comercialmente solo si lo autorizaste.'
          : 'Gracias. Registramos tu solicitud para que ADS Veris revise tu caso y te responda al correo que ingresaste. No necesitas enviarla de nuevo.',
    }
  } catch (error) {
    if (controller.signal.aborted || error.name === 'AbortError' || error.name === 'TimeoutError' || error instanceof TypeError) {
      throw new Error('No pudimos confirmar la recepción por un problema de conexión. No reenvíes inmediatamente; consulta a servicios@adsveris.com para evitar duplicados.')
    }
    throw error
  } finally {
    clearTimeout(timer)
  }
}
