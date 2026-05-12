'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const C = {
  marbleBase:  '#f4f1ec',
  marbleInk:   '#15140f',
  marbleLine:  'rgba(21,20,15,0.12)',
  forestDark:  '#0d2818',
  cream:       '#e8e4d8',
  inkFaint:    'rgba(21,20,15,0.55)',
}

const FALLBACK = [
  {
    id: 'f1', name: 'Oversized Blazer', slug: null, price: 4200, original_price: null, badge: null,
    product_images: [
      { url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80', is_primary: true,  display_order: 0 },
      { url: 'https://images.unsplash.com/photo-1554412933-514a83d2f3cc?w=800&q=80',    is_primary: false, display_order: 1 },
    ],
  },
  {
    id: 'f2', name: 'Bias Mini', slug: null, price: 2800, original_price: null, badge: 'New',
    product_images: [
      { url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80', is_primary: true,  display_order: 0 },
      { url: 'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=800&q=80', is_primary: false, display_order: 1 },
    ],
  },
  {
    id: 'f3', name: 'Linen Column Dress', slug: null, price: 5600, original_price: 6800, badge: null,
    product_images: [
      { url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&q=80', is_primary: true,  display_order: 0 },
      { url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80', is_primary: false, display_order: 1 },
    ],
  },
]

interface ProductImage { url: string; is_primary: boolean; display_order: number }
interface Product { id: string; name: string; slug: string | null; price: number; original_price?: number | null; badge?: string | null; product_images?: ProductImage[] }

function ProductCard({ p }: { p: Product }) {
  const [hover, setHover] = useState(false)
  const sorted = [...(p.product_images ?? [])].sort((a, b) => a.display_order - b.display_order)
  const img1 = sorted[0]?.url ?? 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80'
  const img2 = sorted[1]?.url ?? null

  const inner = (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ position: 'relative', aspectRatio: '2/3', overflow: 'hidden', background: '#ede9e2', cursor: 'pointer' }}
    >
      {/* Primary image */}
      <Image
        src={img1} alt={p.name} fill
        sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 33vw"
        style={{
          objectFit: 'cover', objectPosition: 'top center',
          transform: hover && !img2 ? 'scale(1.04)' : 'scale(1)',
          transition: 'transform 1.4s cubic-bezier(.2,.8,.2,1)',
        }}
      />

      {/* Secondary image — swaps on hover */}
      {img2 && (
        <Image
          src={img2} alt={p.name} fill
          sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 33vw"
          style={{
            objectFit: 'cover', objectPosition: 'top center',
            opacity: hover ? 1 : 0,
            transition: 'opacity 0.5s ease',
          }}
        />
      )}

      {/* Badge */}
      {p.badge && (
        <div style={{
          position: 'absolute', top: 14, left: 14, zIndex: 2,
          fontFamily: "'Raleway',sans-serif", fontSize: 9, letterSpacing: 2.5,
          textTransform: 'uppercase', color: C.marbleInk,
          background: C.cream, padding: '4px 8px',
        }}>{p.badge}</div>
      )}

      {/* Hover overlay — name + price slide up */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 3,
        background: 'linear-gradient(to top, rgba(21,20,15,0.72) 0%, rgba(21,20,15,0.18) 45%, transparent 70%)',
        opacity: hover ? 1 : 0,
        transition: 'opacity 0.35s ease',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        padding: '0 18px 22px',
      }}>
        <div style={{
          transform: hover ? 'translateY(0)' : 'translateY(12px)',
          transition: 'transform 0.35s ease',
        }}>
          <div style={{ fontFamily: "'Prata',serif", fontSize: 20, color: '#fff', lineHeight: 1.15, marginBottom: 6 }}>{p.name}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontFamily: "'Prata',serif", fontSize: 15, color: 'rgba(255,255,255,0.92)' }}>₹{Number(p.price).toLocaleString('en-IN')}</span>
            {p.original_price && <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.55)', textDecoration: 'line-through' }}>₹{Number(p.original_price).toLocaleString('en-IN')}</span>}
          </div>
        </div>
      </div>
    </div>
  )

  if (p.slug) return <Link href={`/products/${p.slug}`} style={{ display: 'block', textDecoration: 'none' }}>{inner}</Link>
  return inner
}

export function ProductsSection({ products }: { products: Product[] }) {
  const display = products.length > 0 ? products : FALLBACK

  return (
    <section id="collection" style={{ backgroundColor: C.marbleBase }}>
      {/* Section header */}
      <div className="collection-header" style={{ padding: '80px 40px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <h2 style={{ fontFamily: "'Prata',serif", fontSize: 'clamp(40px,5.5vw,72px)', lineHeight: 0.95, margin: 0, fontWeight: 400, color: C.marbleInk, letterSpacing: '-0.015em' }}>
          The Collection
        </h2>
        <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: 10, letterSpacing: 3, color: C.inkFaint, textTransform: 'uppercase', paddingBottom: 6 }}>
          {display.length} pieces
        </span>
      </div>

      {/* Grid — 1px gap, no padding, edge-to-edge images */}
      <div className="zara-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 2, padding: '0 2px 2px' }}>
        {display.map(p => <ProductCard key={p.id} p={p} />)}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .zara-grid { grid-template-columns: repeat(2,1fr) !important; }
          .collection-header { padding: 56px 18px 24px !important; }
        }
        @media (max-width: 500px) {
          .zara-grid { grid-template-columns: 1fr !important; gap: 1px !important; }
        }
      `}</style>
    </section>
  )
}
