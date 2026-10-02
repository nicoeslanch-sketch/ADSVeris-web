export const CONTACT_SERVICES = [
  { label: 'Planilla Excel Personalizada', key: 'planilla' },
  { label: 'Descarga de planilla gratuita', key: 'planilla' },
  { label: 'Página Web', key: 'web' },
  { label: 'Reparación urgente WordPress', key: 'web' },
  { label: 'Mantenimiento Esencial WordPress', key: 'web' },
  { label: 'Alojamiento Profesional WordPress', key: 'web' },
  { label: 'WordPress Integral', key: 'web' },
  { label: 'Optimización de Procesos', key: 'procesos' },
  { label: 'Plataforma de Análisis', key: 'plataforma' },
]

function normalize(value) {
  return typeof value === 'string'
    ? value.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    : ''
}

export function findContactService(value) {
  const normalized = normalize(value)
  return CONTACT_SERVICES.find(service => normalize(service.label) === normalized || service.key === normalized) || null
}

export const PRIVACY_VERSION = '2026-10-01'
