const HERO_VIDEO = 'https://www.image2url.com/r2/default/videos/1777724136438-04a54608-2177-459d-8508-28da8ae9a31a.mp4'

function Corner({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  const positions: Record<string, React.CSSProperties> = {
    tl: { top: 12, left: 12 },
    tr: { top: 12, right: 12 },
    bl: { bottom: 12, left: 12 },
    br: { bottom: 12, right: 12 },
  }
  const rotate: Record<string, number> = { tl: 0, tr: 90, br: 180, bl: 270 }
  return (
    <div style={{
      position: 'absolute', ...positions[pos], width: 14, height: 14,
      borderTop: '1px solid rgba(232,228,216,0.5)',
      borderLeft: '1px solid rgba(232,228,216,0.5)',
      opacity: 0.5,
      transform: `rotate(${rotate[pos]}deg)`,
    }} />
  )
}

export function Hero() {
  return (
    <section style={{ position: 'relative', overflow: 'hidden', background: '#0a0a0a' }}>
      <div style={{
        position: 'relative', width: '100%',
        minHeight: 'calc(100vh - 60px)', overflow: 'hidden',
      }} className="hero-min">
        <video
          key={HERO_VIDEO}
          src={HERO_VIDEO}
          autoPlay muted loop playsInline preload="metadata"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        <Corner pos="tl" /><Corner pos="tr" /><Corner pos="bl" /><Corner pos="br" />
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%',
          background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          fontFamily: "'Raleway',sans-serif", fontSize: 9, letterSpacing: 3,
          color: 'rgba(232,228,216,0.7)', textAlign: 'center',
          animation: 'scrollDown 1.5s ease-in-out infinite',
        }}>↓</div>
      </div>
      <style>{`
        @media (max-width: 700px) { .hero-min { min-height: 60vh !important; } }
      `}</style>
    </section>
  )
}
