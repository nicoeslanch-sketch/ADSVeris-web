// A small localhost-only smoke test. Not a Vercel or Kommo load benchmark.
import { performance } from 'node:perf_hooks'

const total = 100
const concurrency = 10
const timings = []
let next = 0
let failures = 0
const started = performance.now()
await Promise.all(Array.from({ length: concurrency }, async () => {
  while (next < total) {
    next++
    const start = performance.now()
    try {
      const response = await fetch('http://127.0.0.1:4173/tienda.html', { signal: AbortSignal.timeout(5000) })
      await response.text()
      if (!response.ok) failures++
    } catch { failures++ }
    timings.push(performance.now() - start)
  }
}))
timings.sort((a, b) => a - b)
console.log(JSON.stringify({ scope: 'LOCAL HTML ONLY — not real visitors or production capacity', requests: total, concurrency,
  failures, elapsedMs: Math.round(performance.now() - started), p95Ms: Math.round(timings[Math.ceil(timings.length * .95) - 1]) }))
if (failures) process.exitCode = 1
