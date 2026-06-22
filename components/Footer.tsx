'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Logo } from './Logo'

const C = {
  forestDark: '#0d2818',
  cream:      '#e8e4d8',
  creamFaint: 'rgba(232,228,216,0.4)',
  creamLine:  'rgba(232,228,216,0.12)',
  creamSoft:  'rgba(232,228,216,0.7)',
}

const F: React.CSSProperties = { fontFamily: "'Raleway',sans-serif" }

const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
)

const HELP = [
  { label: 'About',              href: '/about' },
  { label: 'Contact',            href: '/contact' },
  { label: 'Returns & Exchange', href: '/returns' },
  { label: 'Size guide',         href: '/size-guide' },
  { label: 'FAQ',                href: '/faq' },
  { label: 'Privacy Policy',     href: '/privacy' },
]

export function Footer() {
  const [phone, setPhone] = useState('')
  const [ok, setOk] = useState(false)

  return (
    <footer id="archive" className="footer-section" style={{ background: C.forestDark, color: C.cream }}>
      {/* Stay in touch + Instagram */}
      <div className="footer-top" style={{ padding: '80px 40px 60px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: "'Prata',serif", fontSize: 'clamp(28px,4vw,40px)', color: C.cream, fontWeight: 400, margin: '0 0 12px' }}>
          Stay in touch.
        </h2>
        <p style={{ ...F, fontSize: 13, color: C.creamSoft, margin: '0 0 32px' }}>
          Be the first to get exclusive offers and early access
        </p>

        <form
          onSubmit={(e) => { e.preventDefault(); if (phone.trim()) setOk(true) }}
          style={{ display: 'flex', gap: 0, maxWidth: 420, margin: '0 auto', alignItems: 'stretch' }}
        >
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={ok ? 'Thank you —' : '+91 00000 00000'}
            style={{
              flex: 1, background: 'rgba(232,228,216,0.08)',
              border: `1px solid rgba(232,228,216,0.2)`, borderRight: 'none',
              borderRadius: '30px 0 0 30px',
              padding: '14px 20px', color: C.cream,
              ...F, fontSize: 13, outline: 'none',
            }}
          />
          <button
            type="submit"
            style={{
              background: 'rgba(232,228,216,0.08)', border: `1px solid rgba(232,228,216,0.2)`, borderLeft: 'none',
              borderRadius: '0 30px 30px 0',
              padding: '0 20px', color: C.cream, cursor: 'pointer',
              ...F, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 600,
              whiteSpace: 'nowrap',
            }}
          >
            {ok ? '✓ Added' : 'WhatsApp →'}
          </button>
        </form>

        {/* Instagram button */}
        <a
          href="https://www.instagram.com/wilourin"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            border: `1px solid rgba(232,228,216,0.3)`, borderRadius: 30,
            padding: '12px 28px', marginTop: 32,
            color: C.cream, textDecoration: 'none',
            ...F, fontSize: 14, fontWeight: 500,
          }}
        >
          <InstagramIcon /> Instagram
        </a>
      </div>

      {/* Links */}
      <div className="footer-links" style={{
        borderTop: `1px solid ${C.creamLine}`,
        margin: '0 40px', padding: '40px 0', textAlign: 'center',
      }}>
        <div style={{ ...F, fontSize: 10, letterSpacing: 2.5, color: C.creamFaint, textTransform: 'uppercase', fontWeight: 600, marginBottom: 20 }}>
          — Help
        </div>
        {HELP.map(link => (
          <Link key={link.label} href={link.href} style={{
            display: 'block', textAlign: 'center', padding: '10px 0',
            ...F, fontSize: 14, color: C.cream, textDecoration: 'none',
          }}>{link.label}</Link>
        ))}
      </div>

      {/* Bottom — small logo + subtle copyright */}
      <div style={{
        borderTop: `1px solid ${C.creamLine}`,
        margin: '0 40px',
        padding: '32px 0',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
      }}>
        <div style={{ filter: 'brightness(0) invert(1)' }}>
          <Logo height={48} />
        </div>
        <p style={{ ...F, fontSize: 9, letterSpacing: 2, color: C.creamFaint, textTransform: 'uppercase', margin: 0 }}>
          © 2026 Wilourin Pvt Ltd · Ahmedabad
        </p>
      </div>

      <style>{`
        @media (max-width: 700px) {
          .footer-top { padding: 60px 20px 40px !important; }
          .footer-links { margin: 0 20px !important; }
        }
      `}</style>
    </footer>
  )
}
