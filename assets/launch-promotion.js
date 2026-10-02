// One public source of truth, shared by catalogue, React form and server.
export const LAUNCH_PROMOTION = Object.freeze({
  startsAt: '2026-10-01T03:00:00.000Z',
  endsAt: '2026-10-16T02:59:59.999Z',
  deadlineLabel: '15 de octubre de 2026, a las 23:59 (Chile continental)',
})

export function isLaunchPromotionActive(now = Date.now()) {
  const time = Number(now)
  return Number.isFinite(time) && time >= Date.parse(LAUNCH_PROMOTION.startsAt) && time <= Date.parse(LAUNCH_PROMOTION.endsAt)
}

export function launchPromotionMarkup() {
  if (!isLaunchPromotionActive()) return '<p class="small">La promoción de inauguración finalizó. Consulta la disponibilidad y el precio de las planillas; no hay cobros automáticos.</p>'
  return `<aside class="launch-promotion" aria-label="Promoción de inauguración">
    <span class="eyebrow">Inauguración ADS Veris · Por tiempo limitado</span>
    <h2>Inauguramos ADS Veris. Tú te llevas las herramientas.</h2>
    <p>Organiza caja, ventas e inventario con nuestras 11 planillas Excel por <strong>$0 CLP</strong>. Deja tu nombre y correo y solicita tu descarga.</p>
    <p class="small">Válida hasta el ${LAUNCH_PROMOTION.deadlineLabel}. No es una oferta permanente. Publicidad y teléfono opcionales. Personalizaciones no incluidas.</p>
    <a class="text-link" href="/terminos.html#promocion-inauguracion">Ver condiciones de la promoción</a>
  </aside>`
}
