'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Logo } from '@/components/Logo'

const C = { marbleBase: '#f4f1ec', marbleInk: '#15140f', marbleLine: 'rgba(21,20,15,0.22)', forestDark: '#0d2818', cream: '#e8e4d8', inkFaint: 'rgba(21,20,15,0.55)' }
const F = { fontFamily: "'Raleway',sans-serif" }

function SuccessContent() {
  const params = useSearchParams()
  const id = params.get('id')

  return (
    <div style={{ minHeight: '100vh', background: C.marbleBase }}>
      <div style={{ borderBottom: `1px solid ${C.marbleLine}`, padding: '20px 40px' }}>
        <a href="/"><Logo height={36} /></a>
      </div>
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 24 }}>✓</div>
        <h1 style={{ fontFamily: "'Prata',serif", fontSize: 36, color: C.marbleInk, fontWeight: 400, margin: '0 0 16px' }}>Order Confirmed</h1>
        <p style={{ ...F, fontSize: 14, color: C.inkFaint, lineHeight: 1.7, marginBottom: 8 }}>
          Thank you for your order. We're preparing your piece with care.
        </p>
        {id && <p style={{ ...F, fontSize: 11, color: C.inkFaint, letterSpacing: 1, marginBottom: 40 }}>Order #{id.slice(0, 8).toUpperCase()}</p>}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/account" style={{ padding: '13px 28px', background: C.forestDark, color: C.cream, textDecoration: 'none', ...F, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', fontWeight: 600 }}>
            View Orders
          </a>
          <a href="/" style={{ padding: '13px 28px', background: 'transparent', border: `1px solid ${C.marbleLine}`, color: C.marbleInk, textDecoration: 'none', ...F, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase' }}>
            Continue Shopping
          </a>
        </div>
      </div>
    </div>
  )
}

export default function OrderSuccessPage() {
  return <Suspense fallback={null}><SuccessContent /></Suspense>
}
