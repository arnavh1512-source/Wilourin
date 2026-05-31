'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Logo } from './Logo'

const C = {
  forestDark: '#0d2818',
  cream:      '#e8e4d8',
  creamFaint: 'rgba(232,228,216,0.55)',
  creamLine:  'rgba(232,228,216,0.12)',
}

const InstagramIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
)

const WhatsAppIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
  </svg>
)

function FooterCol({ title, items }: { title: string; items: { label: string; href: string }[] }) {
  return (
    <div>
      <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 10, letterSpacing: 2.5, color: C.creamFaint, textTransform: 'uppercase', fontWeight: 600, marginBottom: 20 }}>
        — {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map((i) => (
          <Link key={i.label} href={i.href} style={{ fontFamily: "'Raleway',sans-serif", fontSize: 14, color: C.cream, textDecoration: 'none' }}>
            {i.label}
          </Link>
        ))}
      </div>
    </div>
  )
}

const STUDIO = [
  { label: 'About',           href: '/about' },
  { label: 'Provenance',      href: '#' },
  { label: 'Mending service', href: '#' },
  { label: 'Stockists',       href: '#' },
  { label: 'Press',           href: 'mailto:press@wilourin.com' },
]
const HELP = [
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
    <footer id="archive" className="footer-section" style={{ background: C.forestDark, color: C.cream, padding: '120px 40px 40px' }}>
      <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 1fr', gap: 60, paddingBottom: 80, borderBottom: `1px solid ${C.creamLine}` }}>
        {/* Stay in touch */}
        <div>
          <div style={{ fontFamily: "'Prata',serif", fontSize: 36, lineHeight: 1.1, color: C.cream, letterSpacing: '-0.01em' }}>
            Stay in touch.
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); if (phone) setOk(true) }}
            style={{ marginTop: 28, display: 'flex', gap: 0, alignItems: 'stretch', maxWidth: 420 }}
          >
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={ok ? 'thank you —' : '+91 00000 00000'}
              style={{
                flex: 1, background: 'transparent',
                border: `1px solid rgba(232,228,216,0.2)`, borderRight: 'none',
                padding: '14px 16px', color: C.cream,
                fontFamily: "'Raleway',sans-serif", fontSize: 14, outline: 'none',
              }}
            />
            <button
              type="submit"
              style={{
                background: C.cream, color: C.forestDark, border: 'none',
                padding: '0 24px', fontFamily: "'Raleway',sans-serif",
                fontSize: 10, letterSpacing: 2.5, textTransform: 'uppercase',
                cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap',
              }}
            >
              {ok ? '✓ Added' : 'WhatsApp →'}
            </button>
          </form>
        </div>

        <FooterCol title="Studio" items={STUDIO} />
        <FooterCol title="Help"   items={HELP} />
      </div>

      {/* Bottom */}
      <div className="footer-bottom" style={{ paddingTop: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 30 }}>
        <div style={{ filter: 'brightness(0) invert(1)' }}>
          <Logo height={120} />
        </div>
        <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 14, letterSpacing: 2, color: C.creamFaint, textTransform: 'uppercase', fontWeight: 600, textAlign: 'right', lineHeight: 1.8 }}>
          © 2026 WILOURIN STUDIO PVT LTD<br />
          <span style={{ fontSize: 18, letterSpacing: 3 }}>AHMEDABAD</span>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" style={{ color: C.creamFaint }}>
              <InstagramIcon />
            </a>
            <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '918140081461'}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" style={{ color: C.creamFaint }}>
              <WhatsAppIcon />
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 700px) {
          .footer-section { padding: 60px 20px 32px !important; }
          .footer-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .footer-bottom { flex-direction: column !important; align-items: flex-start !important; gap: 16px !important; }
        }
      `}</style>
    </footer>
  )
}
