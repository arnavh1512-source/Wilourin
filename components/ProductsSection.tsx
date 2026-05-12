'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const C = {
  marbleBase:     '#f4f1ec',
  marbleInk:      '#15140f',
  marbleInkFaint: 'rgba(21,20,15,0.58)',
  marbleLine:     'rgba(21,20,15,0.22)',
  forestDark:     '#0d2818',
  cream:          '#e8e4d8',
}

const FALLBACK = [
  { id: 'f1', name: 'Oversized Blazer', slug: null, price: 4200, original_price: null, badge: null, product_images: [{ url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80', is_primary: true, display_order: 0 }] },
  { id: 'f2', name: 'Bias Mini',        slug: null, price: 2800, original_price: null, badge: null, product_images: [{ url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80', is_primary: true, display_order: 0 }] },
]

interface ProductImage { url: string; is_primary: boolean; display_order: number }
interface Product { id: string; name: string; slug: string | null; price: number; original_price?: number | null; badge?: string | null; product_images?: ProductImage[] }

function ProductCard({ p }: { p: Product }) {
  const [hover, setHover] = useState(false)
  const img = p.product_images?.sort((a, b) => a.display_order - b.display_order)[0]?.url ?? 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80'

  const card = (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          position: 'relative', aspectRatio: '2/3',
          background: '#fafaf7', border: `1px solid ${C.marbleLine}`,
          overflow: 'hidden',
          boxShadow: hover ? '0 30px 60px -30px rgba(13,40,24,0.4)' : '0 10px 30px -20px rgba(13,40,24,0.15)',
          transition: 'box-shadow 0.4s, transform 0.4s',
          transform: hover ? 'translateY(-4px)' : 'translateY(0)',
        }}
      >
        <Image
          src={img} alt={p.name} fill
          sizes="(max-width: 700px) 100vw, 50vw"
          style={{ objectFit: 'cover', objectPosition: 'top center', transform: hover ? 'scale(1.04)' : 'scale(1)', transition: 'transform 1.2s cubic-bezier(.2,.8,.2,1)' }}
        />
        <div style={{ position: 'absolute', top: 10, left: 10, width: 12, height: 12, borderTop: '1px solid rgba(232,228,216,0.6)', borderLeft: '1px solid rgba(232,228,216,0.6)' }} />
        <div style={{ position: 'absolute', top: 10, right: 10, width: 12, height: 12, borderTop: '1px solid rgba(232,228,216,0.6)', borderRight: '1px solid rgba(232,228,216,0.6)' }} />
        {p.badge && (
          <div style={{ position: 'absolute', bottom: 14, left: 14, background: C.forestDark, color: C.cream, padding: '4px 10px', fontFamily: "'Raleway',sans-serif", fontSize: 9, letterSpacing: 2, textTransform: 'uppercase' }}>{p.badge}</div>
        )}
      </div>

      <div style={{ paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ fontFamily: "'Prata',serif", fontSize: 22, color: C.marbleInk, lineHeight: 1.15, letterSpacing: '-0.01em' }}>{p.name}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span style={{ fontFamily: "'Prata',serif", fontSize: 16, color: C.marbleInk }}>₹{Number(p.price).toLocaleString('en-IN')}</span>
          {p.original_price && <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: C.marbleInkFaint, textDecoration: 'line-through' }}>₹{Number(p.original_price).toLocaleString('en-IN')}</span>}
        </div>
        <div
          style={{
            marginTop: 10, padding: '13px 0',
            background: hover ? C.forestDark : 'transparent',
            color: hover ? C.cream : C.marbleInk,
            border: `1px solid ${C.marbleLine}`,
            fontFamily: "'Raleway',sans-serif", fontSize: 9,
            letterSpacing: 3, textTransform: 'uppercase', fontWeight: 600,
            textAlign: 'center', transition: 'background 0.25s, color 0.25s',
          }}
        >
          Select Size →
        </div>
      </div>
    </div>
  )

  if (p.slug) return <Link href={`/products/${p.slug}`} style={{ textDecoration: 'none' }}>{card}</Link>
  return card
}

export function ProductsSection({ products }: { products: Product[] }) {
  const display = products.length > 0 ? products : FALLBACK

  return (
    <section id="collection" className="products-section" style={{ backgroundColor: C.marbleBase, padding: '100px 40px 120px', position: 'relative' }}>
      <div style={{ borderBottom: `1px solid ${C.marbleLine}`, paddingBottom: 28, marginBottom: 64 }} className="section-head">
        <h2 style={{ fontFamily: "'Prata',serif", fontSize: 'clamp(44px,6vw,80px)', lineHeight: 0.95, margin: 0, fontWeight: 400, color: C.marbleInk, letterSpacing: '-0.015em' }}>
          The Collection
        </h2>
      </div>

      <div className="products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 40 }}>
        {display.map(p => <ProductCard key={p.id} p={p} />)}
      </div>

      <style>{`
        @media (max-width: 700px) {
          .products-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .products-section { padding: 64px 18px 80px !important; }
          .section-head { margin-bottom: 32px !important; }
          .section-head h2 { font-size: clamp(36px,10vw,60px) !important; }
        }
      `}</style>
    </section>
  )
}
