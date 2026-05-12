const C = {
  forestDark: '#0d2818',
  cream:      '#e8e4d8',
  creamFaint: 'rgba(232,228,216,0.55)',
}

export function Philosophy() {
  return (
    <section
      className="philosophy-section"
      style={{
        background: C.forestDark,
        padding: '100px 40px',
        color: C.cream,
        position: 'relative',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <p style={{
          fontFamily: "'Prata',serif",
          fontSize: 'clamp(28px,4vw,42px)',
          lineHeight: 1.25,
          color: C.cream,
          letterSpacing: '-0.01em',
          margin: 0,
          fontWeight: 400,
        }}>
          Clothes that don&apos;t shout.
        </p>
        <div style={{
          fontFamily: "'Raleway',sans-serif",
          fontSize: 10,
          letterSpacing: 3,
          color: C.creamFaint,
          marginTop: 24,
          textTransform: 'uppercase',
        }}>
          AHMEDABAD
        </div>
      </div>
      <style>{`
        @media (max-width: 700px) { .philosophy-section { padding: 64px 20px !important; } }
      `}</style>
    </section>
  )
}
