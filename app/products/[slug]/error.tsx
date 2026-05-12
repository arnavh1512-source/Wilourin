'use client'

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f4f1ec', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
      <p style={{ fontFamily: "'Prata',serif", fontSize: 22, color: 'rgba(21,20,15,0.55)', fontStyle: 'italic' }}>Something went wrong.</p>
      <button onClick={reset} style={{ fontFamily: "'Raleway',sans-serif", fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', background: '#0d2818', color: '#e8e4d8', border: 'none', padding: '13px 28px', cursor: 'pointer' }}>
        Try Again
      </button>
    </div>
  )
}
