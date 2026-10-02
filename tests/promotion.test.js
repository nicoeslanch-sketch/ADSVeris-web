import { test } from 'node:test'
import assert from 'node:assert/strict'
import { LAUNCH_PROMOTION, isLaunchPromotionActive } from '../assets/launch-promotion.js'
import { readFile } from 'node:fs/promises'

test('vigencia real compartida, sin contadores reiniciados por visitante', async () => {
  const start = Date.parse(LAUNCH_PROMOTION.startsAt)
  const end = Date.parse(LAUNCH_PROMOTION.endsAt)
  assert.equal(isLaunchPromotionActive(start - 1), false)
  assert.equal(isLaunchPromotionActive(start), true)
  assert.equal(isLaunchPromotionActive(end), true)
  assert.equal(isLaunchPromotionActive(end + 1), false)
  assert.equal(isLaunchPromotionActive(NaN), false)
  const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Santiago', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(end))
  assert.equal(date, '2026-10-15')
  for (const file of ['terminos.html', 'legal.html']) {
    const html = await readFile(file, 'utf8')
    assert.match(html, /id="promocion-inauguracion"/)
    assert.match(html, /15 de octubre de 2026 a las 23:59/)
    assert.match(html, /No hay límite de unidades digitales/)
  }
})
