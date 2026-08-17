export default function AuthBrand() {
  return (
    <a href="/" style={s.wrap} aria-label="Ir al inicio de ADS Veris">
      <span style={s.mark} aria-hidden="true">
        <img src="/images/logo-ads-veris.png" alt="" style={s.image} />
      </span>
      <span style={s.name}>ADS <span style={s.gold}>Veris</span></span>
    </a>
  )
}

const s = {
  wrap: { display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flexShrink: 0 },
  mark: {
    width: '38px', height: '38px', display: 'grid', placeItems: 'center', overflow: 'hidden',
    borderRadius: '10px', border: '1px solid rgba(95,184,181,0.3)', background: 'rgba(255,255,255,0.04)',
  },
  image: { width: '100%', height: '100%', maxWidth: 'none', objectFit: 'fill', transform: 'scale(2.8)' },
  name: {
    fontSize: '17px', fontWeight: '700', color: '#f5f9fe',
    fontFamily: "'Sora', sans-serif", whiteSpace: 'nowrap',
  },
  gold: { color: '#c9a84c' },
}
