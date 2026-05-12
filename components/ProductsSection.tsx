'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useCartStore } from '@/lib/store'

const C = {
  marbleBase:    '#f4f1ec',
  marbleInk:     '#15140f',
  marbleInkFaint:'rgba(21,20,15,0.58)',
  marbleLine:    'rgba(21,20,15,0.22)',
  forestDark:    '#0d2818',
  cream:         '#e8e4d8',
}

const PRODUCTS = [
  {
    id: 'blazer',
    name: 'Oversized Blazer',
    img: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80',
  },
  {
    id: 'dress',
    name: 'Bias Mini',
    img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
  },
]

function ProductCard({ p }: { p: typeof PRODUCTS[0] }) {
  const [hover, setHover] = useState(false)
  const add = useCartStore((s) => s.add)

  return (
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
          src={p.img}
          alt={p.name}
          fill
          sizes="(max-width: 700px) 100vw, 50vw"
          style={{
            objectFit: 'cover', objectPosition: 'top center',
            transform: hover ? 'scale(1.04)' : 'scale(1)',
            transition: 'transform 1.2s cubic-bezier(.2,.8,.2,1)',
          }}
        />
        {/* corner accents */}
        <div style={{ position: 'absolute', top: 10, left: 10, width: 12, height: 12, borderTop: '1px solid rgba(232,228,216,0.6)', borderLeft: '1px solid rgba(232,228,216,0.6)' }} />
        <div style={{ position: 'absolute', top: 10, right: 10, width: 12, height: 12, borderTop: '1px solid rgba(232,228,216,0.6)', borderRight: '1px solid rgba(232,228,216,0.6)' }} />
      </div>

      <div style={{ paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ fontFamily: "'Prata',serif", fontSize: 22, color: C.marbleInk, lineHeight: 1.15, letterSpacing: '-0.01em' }}>
          {p.name}
        </div>
        <button
          onClick={() => add({ id: p.id, name: p.name, img: p.img })}
          style={{
            marginTop: 14, padding: '13px 0',
            background: 'transparent', color: C.marbleInk,
            border: `1px solid ${C.marbleLine}`,
            fontFamily: "'Raleway',sans-serif", fontSize: 9,
            letterSpacing: 3, textTransform: 'uppercase', fontWeight: 600,
            cursor: 'pointer', transition: 'background 0.25s, color 0.25s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = C.forestDark; e.currentTarget.style.color = C.cream }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.marbleInk }}
        >
          Add to bag →
        </button>
      </div>
    </div>
  )
}

export function ProductsSection() {
  return (
    <section
      id="collection"
      className="products-section"
      style={{ backgroundColor: C.marbleBase, padding: '100px 40px 120px', position: 'relative' }}
    >
      {/* Section head */}
      <div style={{ borderBottom: `1px solid ${C.marbleLine}`, paddingBottom: 28, marginBottom: 64 }} className="section-head">
        <h2 style={{ fontFamily: "'Prata',serif", fontSize: 'clamp(44px,6vw,80px)', lineHeight: 0.95, margin: 0, fontWeight: 400, color: C.marbleInk, letterSpacing: '-0.015em' }}>
          The Collection
        </h2>
      </div>

      <div className="products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 40 }}>
        {PRODUCTS.map((p) => <ProductCard key={p.id} p={p} />)}
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
