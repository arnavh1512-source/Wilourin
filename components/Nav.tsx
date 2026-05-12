'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Logo } from './Logo'
import { useCartStore } from '@/lib/store'

const IC = '#115511'
const btn: React.CSSProperties = {
  background: 'transparent', border: 'none', cursor: 'pointer',
  padding: 6, display: 'inline-flex', alignItems: 'center',
  justifyContent: 'center', color: IC, position: 'relative',
}

const IconSearch = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
  </svg>
)
const IconUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8.5" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>
  </svg>
)
const IconHeart = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20.5s-7.5-4.5-9.4-9.2C1.2 7.6 4 4 7.5 4c2 0 3.5 1.2 4.5 2.8C13 5.2 14.5 4 16.5 4 20 4 22.8 7.6 21.4 11.3 19.5 16 12 20.5 12 20.5z"/>
  </svg>
)
const IconBag = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>
  </svg>
)

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const { toggle, items } = useCartStore()
  const cartCount = items.length

  useEffect(() => {
    const s = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', s)
    return () => window.removeEventListener('scroll', s)
  }, [])

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: scrolled ? 'rgba(244,241,236,0.92)' : 'rgba(244,241,236,0.7)',
      backdropFilter: 'blur(18px)',
      WebkitBackdropFilter: 'blur(18px)',
      borderBottom: '1px solid rgba(21,20,15,0.22)',
      transition: 'background 0.3s',
    }}>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center', padding: '16px 32px',
      }}>
        {/* Left */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button style={btn} aria-label="Search"><IconSearch /></button>
          <button style={btn} aria-label="Account"><IconUser /></button>
        </div>

        {/* Center — Logo */}
        <Link href="/" style={{ display: 'flex', justifyContent: 'center' }}>
          <Logo height={50} />
        </Link>

        {/* Right */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
          <button style={btn} aria-label="Wishlist"><IconHeart /></button>
          <button onClick={toggle} style={btn} aria-label="Cart">
            <IconBag />
            {cartCount > 0 && (
              <span style={{
                position: 'absolute', top: 0, right: -2,
                background: '#1f4a30', color: '#e8e4d8',
                padding: '1px 5px', fontSize: 8, borderRadius: 999,
                fontWeight: 700, fontFamily: "'Raleway',sans-serif",
                lineHeight: '14px', minWidth: 14, textAlign: 'center',
              }}>{cartCount}</span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav tweaks */}
      <style>{`
        @media (max-width: 700px) {
          nav > div { padding: 12px 16px !important; }
        }
      `}</style>
    </nav>
  )
}
