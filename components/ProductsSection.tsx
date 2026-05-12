'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/lib/store'

const C = {
  marbleBase:     '#f4f1ec',
  marbleInk:      '#15140f',
  marbleInkFaint: 'rgba(21,20,15,0.58)',
  marbleLine:     'rgba(21,20,15,0.22)',
  forestDark:     '#0d2818',
  cream:          '#e8e4d8',
}

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const FILTERS = ['ALL', 'NEW', 'DRESSES', 'TOPS', 'BLAZERS', 'TROUSERS', 'KNITWEAR', 'CO-ORD SETS']

const FALLBACK = [
  { id: 'f1', name: 'Oversized Blazer', slug: null, price: 4200, original_price: null, badge: null, category: 'BLAZERS', product_images: [{ url: '/productBlazer.png', is_primary: true, display_order: 0 }], product_variants: [] },
  { id: 'f2', name: 'Bias Mini',        slug: null, price: 2800, original_price: null, badge: null, category: 'DRESSES', product_images: [{ url: '/productDress.png',  is_primary: true, display_order: 0 }], product_variants: [] },
]

interface ProductImage { url: string; is_primary: boolean; display_order: number }
interface Variant { size: string; stock_qty: number }
interface Product {
  id: string; name: string; slug: string | null; price: number
  original_price?: number | null; badge?: string | null; category?: string | null
  product_images?: ProductImage[]; product_variants?: Variant[]
}

function ProductCard({ p }: { p: Product }) {
  const [hover, setHover]       = useState(false)
  const [sizeOpen, setSizeOpen] = useState(false)
  const [added, setAdded]       = useState(false)
  const add = useCartStore(s => s.add)

  const sorted = [...(p.product_images ?? [])].sort((a, b) => a.display_order - b.display_order)
  const img1 = sorted[0]?.url ?? '/productBlazer.png'
  const img2 = sorted[1]?.url ?? null
  const variants = p.product_variants ?? []

  const isAvailable = (size: string) => {
    const v = variants.find(x => x.size === size)
    return !v || v.stock_qty > 0
  }

  const handleSizeClick = (e: React.MouseEvent, size: string) => {
    e.preventDefault(); e.stopPropagation()
    if (!isAvailable(size)) return
    add({ id: p.id, name: p.name, img: img1, price: p.price, size, quantity: 1 })
    setAdded(true); setSizeOpen(false)
    setTimeout(() => setAdded(false), 2000)
  }

  const toggleSize = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    setSizeOpen(o => !o)
  }

  const inner = (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Image with dual-swap on hover */}
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
        <Image src={img1} alt={p.name} fill sizes="(max-width:700px) 100vw, 50vw"
          style={{ objectFit: 'cover', objectPosition: 'top center', transform: hover && !img2 ? 'scale(1.04)' : 'scale(1)', transition: 'transform 1.2s cubic-bezier(.2,.8,.2,1)' }} />
        {img2 && (
          <Image src={img2} alt={p.name} fill sizes="(max-width:700px) 100vw, 50vw"
            style={{ objectFit: 'cover', objectPosition: 'top center', opacity: hover ? 1 : 0, transition: 'opacity 0.45s ease' }} />
        )}
        <div style={{ position: 'absolute', top: 10, left: 10, width: 12, height: 12, borderTop: '1px solid rgba(232,228,216,0.6)', borderLeft: '1px solid rgba(232,228,216,0.6)' }} />
        <div style={{ position: 'absolute', top: 10, right: 10, width: 12, height: 12, borderTop: '1px solid rgba(232,228,216,0.6)', borderRight: '1px solid rgba(232,228,216,0.6)' }} />
        {p.badge && (
          <div style={{ position: 'absolute', bottom: 14, left: 14, background: C.forestDark, color: C.cream, padding: '4px 10px', fontFamily: "'Raleway',sans-serif", fontSize: 9, letterSpacing: 2, textTransform: 'uppercase' }}>{p.badge}</div>
        )}
      </div>

      {/* Info + size picker */}
      <div style={{ paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ fontFamily: "'Prata',serif", fontSize: 22, color: C.marbleInk, lineHeight: 1.15, letterSpacing: '-0.01em' }}>{p.name}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span style={{ fontFamily: "'Prata',serif", fontSize: 16, color: C.marbleInk }}>₹{Number(p.price).toLocaleString('en-IN')}</span>
          {p.original_price && <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: C.marbleInkFaint, textDecoration: 'line-through' }}>₹{Number(p.original_price).toLocaleString('en-IN')}</span>}
        </div>

        {/* Inline size picker (Zara quick-add) */}
        {sizeOpen ? (
          <div onClick={e => e.stopPropagation()} style={{ marginTop: 10, border: `1px solid ${C.marbleLine}`, padding: '12px 12px 14px' }}>
            <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: C.marbleInkFaint, marginBottom: 10 }}>Select Size</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {SIZES.map(size => {
                const avail = isAvailable(size)
                return (
                  <button key={size} onClick={e => handleSizeClick(e, size)} disabled={!avail}
                    style={{ width: 40, height: 40, border: `1px solid ${C.marbleLine}`, background: 'transparent', color: avail ? C.marbleInk : 'rgba(21,20,15,0.2)', fontFamily: "'Raleway',sans-serif", fontSize: 11, cursor: avail ? 'pointer' : 'not-allowed', textDecoration: !avail ? 'line-through' : 'none', transition: 'all 0.15s' }}
                    onMouseEnter={e => { if (avail) { const b = e.target as HTMLButtonElement; b.style.background = C.forestDark; b.style.color = C.cream } }}
                    onMouseLeave={e => { const b = e.target as HTMLButtonElement; b.style.background = 'transparent'; b.style.color = avail ? C.marbleInk : 'rgba(21,20,15,0.2)' }}
                  >{size}</button>
                )
              })}
            </div>
          </div>
        ) : (
          <div onClick={toggleSize} style={{ marginTop: 10, padding: '13px 0', background: added ? C.forestDark : hover ? C.forestDark : 'transparent', color: added ? C.cream : hover ? C.cream : C.marbleInk, border: `1px solid ${C.marbleLine}`, fontFamily: "'Raleway',sans-serif", fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', fontWeight: 600, textAlign: 'center', transition: 'background 0.25s, color 0.25s', cursor: 'pointer' }}>
            {added ? '✓ Added to Bag' : 'Select Size →'}
          </div>
        )}
      </div>
    </div>
  )

  if (p.slug) return <Link href={`/products/${p.slug}`} style={{ textDecoration: 'none' }}>{inner}</Link>
  return inner
}

export function ProductsSection({ products }: { products: Product[] }) {
  const [activeFilter, setActiveFilter] = useState('ALL')
  const all = products.length > 0 ? products : FALLBACK

  const filtered = activeFilter === 'ALL' ? all : all.filter(p =>
    p.category?.toUpperCase() === activeFilter || p.badge?.toUpperCase() === activeFilter
  )

  return (
    <section id="collection" className="products-section" style={{ backgroundColor: C.marbleBase, padding: '100px 40px 120px', position: 'relative' }}>
      <div style={{ borderBottom: `1px solid ${C.marbleLine}`, paddingBottom: 28, marginBottom: 32 }} className="section-head">
        <h2 style={{ fontFamily: "'Prata',serif", fontSize: 'clamp(44px,6vw,80px)', lineHeight: 0.95, margin: 0, fontWeight: 400, color: C.marbleInk, letterSpacing: '-0.015em' }}>
          The Collection
        </h2>
      </div>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 48 }}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => setActiveFilter(f)}
            style={{ padding: '7px 16px', border: `1px solid ${activeFilter === f ? C.marbleInk : C.marbleLine}`, background: activeFilter === f ? C.marbleInk : 'transparent', color: activeFilter === f ? C.cream : C.marbleInk, fontFamily: "'Raleway',sans-serif", fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.15s' }}>
            {f}
          </button>
        ))}
      </div>

      <div className="products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 40 }}>
        {filtered.length > 0
          ? filtered.map(p => <ProductCard key={p.id} p={p} />)
          : <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 0', fontFamily: "'Prata',serif", fontSize: 18, color: C.marbleInkFaint, fontStyle: 'italic' }}>No items in this category yet.</div>
        }
      </div>

      <style>{`
        @media (max-width: 700px) {
          .products-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .products-section { padding: 64px 18px 80px !important; }
          .section-head { margin-bottom: 24px !important; }
          .section-head h2 { font-size: clamp(36px,10vw,60px) !important; }
        }
      `}</style>
    </section>
  )
}
