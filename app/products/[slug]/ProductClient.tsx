'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useCartStore } from '@/lib/store'

const C = {
  marbleBase:  '#f4f1ec',
  marbleInk:   '#15140f',
  marbleLine:  'rgba(21,20,15,0.22)',
  forestDark:  '#0d2818',
  forestEmerald: '#1f4a30',
  cream:       '#e8e4d8',
  inkFaint:    'rgba(21,20,15,0.55)',
  inkSoft:     'rgba(21,20,15,0.78)',
}

interface Variant { id: string; size: string; stock_qty: number }
interface ProductImage { id: string; url: string; is_primary: boolean; display_order: number }
interface Product {
  id: string; name: string; slug: string; description?: string
  price: number; original_price?: number; badge?: string
  product_images: ProductImage[]
  product_variants: Variant[]
}

const FIT_MEASURES = [
  { key: 'chest',  label: 'Chest',  unit: 'cm', min: -6, max: 6, step: 0.5 },
  { key: 'waist',  label: 'Waist',  unit: 'cm', min: -6, max: 6, step: 0.5 },
  { key: 'hips',   label: 'Hips',   unit: 'cm', min: -6, max: 6, step: 0.5 },
  { key: 'length', label: 'Length', unit: 'cm', min: -4, max: 4, step: 0.5 },
]

export function ProductClient({ product }: { product: Product }) {
  const images = [...product.product_images].sort((a, b) => a.display_order - b.display_order)
  const variants = product.product_variants ?? []

  const [activeImg, setActiveImg] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [fitOpen, setFitOpen] = useState(false)
  const [fit, setFit] = useState<Record<string, number>>(() => Object.fromEntries(FIT_MEASURES.map(m => [m.key, 0])))
  const [added, setAdded] = useState(false)
  const [error, setError] = useState('')

  const add = useCartStore(s => s.add)

  const handleAdd = () => {
    if (!selectedSize) { setError('Please select a size'); return }
    const variant = variants.find(v => v.size === selectedSize)
    if (variant && variant.stock_qty === 0) { setError('This size is out of stock'); return }
    setError('')

    const hasCustomFit = Object.values(fit).some(v => v !== 0)
    add({
      id: product.id,
      variantId: variant?.id,
      name: product.name,
      img: images[activeImg]?.url ?? images[0]?.url ?? '',
      price: product.price,
      size: selectedSize,
      quantity: 1,
      customFit: hasCustomFit ? fit : undefined,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const F = { fontFamily: "'Raleway',sans-serif" }
  const sizeAvailable = (size: string) => {
    const v = variants.find(x => x.size === size)
    return !v || v.stock_qty > 0
  }

  return (
    <div style={{ minHeight: '100vh', background: C.marbleBase }}>
      {/* Back nav + image counter */}
      <div style={{ padding: '20px 40px', borderBottom: `1px solid ${C.marbleLine}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="/#collection" style={{ ...F, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: C.inkFaint, textDecoration: 'none' }}>← The Collection</a>
        {images.length > 1 && (
          <span style={{ ...F, fontSize: 10, letterSpacing: 2, color: C.inkFaint }}>{activeImg + 1} / {images.length}</span>
        )}
      </div>

      <div className="product-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, maxWidth: 1200, margin: '0 auto' }}>
        {/* Stacked full-bleed images */}
        <div style={{ padding: '40px 40px 40px 40px' }}>
          {images.length > 0 ? images.map((img, i) => (
            <div key={img.id}
              onMouseEnter={() => setActiveImg(i)}
              style={{ position: 'relative', aspectRatio: '3/4', background: '#fafaf7', border: `1px solid ${C.marbleLine}`, overflow: 'hidden', marginBottom: 12 }}>
              <Image src={img.url} alt={`${product.name} ${i + 1}`} fill
                style={{ objectFit: 'cover', objectPosition: 'top center' }}
                sizes="(max-width: 900px) 100vw, 50vw" priority={i === 0} />
            </div>
          )) : (
            <div style={{ aspectRatio: '3/4', background: '#fafaf7', border: `1px solid ${C.marbleLine}` }} />
          )}
        </div>

        {/* Info */}
        <div style={{ padding: '40px 40px 80px 0' }}>
          {product.badge && (
            <div style={{ display: 'inline-block', background: C.forestDark, color: C.cream, padding: '4px 10px', ...F, fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>{product.badge}</div>
          )}

          <h1 style={{ fontFamily: "'Prata',serif", fontSize: 'clamp(32px,4vw,48px)', color: C.marbleInk, fontWeight: 400, lineHeight: 1.1, margin: '0 0 16px' }}>{product.name}</h1>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 24 }}>
            <span style={{ fontFamily: "'Prata',serif", fontSize: 28, color: C.marbleInk }}>₹{Number(product.price).toLocaleString('en-IN')}</span>
            {product.original_price && (
              <span style={{ ...F, fontSize: 16, color: C.inkFaint, textDecoration: 'line-through' }}>₹{Number(product.original_price).toLocaleString('en-IN')}</span>
            )}
          </div>

          {product.description && (
            <p style={{ ...F, fontSize: 14, color: C.inkSoft, lineHeight: 1.7, marginBottom: 32, maxWidth: 480 }}>{product.description}</p>
          )}

          <div style={{ borderTop: `1px solid ${C.marbleLine}`, paddingTop: 28, marginBottom: 28 }}>
            {/* Size selector */}
            <div style={{ ...F, fontSize: 10, letterSpacing: 2.5, textTransform: 'uppercase', color: C.inkFaint, marginBottom: 14 }}>
              Select Size {selectedSize && <span style={{ color: C.marbleInk, fontWeight: 700 }}>— {selectedSize}</span>}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
              {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => {
                const available = variants.length === 0 || sizeAvailable(size)
                const active = selectedSize === size
                return (
                  <button key={size} onClick={() => available && setSelectedSize(size)} disabled={!available}
                    style={{
                      width: 52, height: 52,
                      border: `1px solid ${active ? C.marbleInk : C.marbleLine}`,
                      background: active ? C.marbleInk : 'transparent',
                      color: active ? C.cream : available ? C.marbleInk : 'rgba(21,20,15,0.25)',
                      ...F, fontSize: 11, letterSpacing: 1, fontWeight: active ? 700 : 400,
                      cursor: available ? 'pointer' : 'not-allowed',
                      transition: 'all 0.15s',
                      textDecoration: !available ? 'line-through' : 'none',
                    }}
                  >{size}</button>
                )
              })}
            </div>
            {error && <div style={{ ...F, fontSize: 12, color: '#dc2626', marginTop: 8 }}>{error}</div>}
          </div>

          {/* Personalized Fit */}
          <div style={{ border: `1px solid ${C.marbleLine}`, marginBottom: 28 }}>
            <button
              onClick={() => setFitOpen(!fitOpen)}
              style={{ width: '100%', padding: '16px 20px', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div>
                <div style={{ ...F, fontSize: 10, letterSpacing: 2.5, textTransform: 'uppercase', color: C.marbleInk, fontWeight: 700, textAlign: 'left' }}>Personalized Fit</div>
                <div style={{ ...F, fontSize: 11, color: C.inkFaint, marginTop: 3, textAlign: 'left' }}>Adjust measurements to your body</div>
              </div>
              <span style={{ ...F, fontSize: 18, color: C.inkFaint, fontWeight: 300 }}>{fitOpen ? '−' : '+'}</span>
            </button>

            {fitOpen && (
              <div style={{ padding: '0 20px 24px', borderTop: `1px solid ${C.marbleLine}` }}>
                <p style={{ ...F, fontSize: 12, color: C.inkFaint, marginTop: 16, marginBottom: 20, lineHeight: 1.6 }}>
                  Use the sliders to add or remove centimetres from your standard size. We'll tailor accordingly.
                </p>

                {FIT_MEASURES.map(m => {
                  const val = fit[m.key]
                  return (
                    <div key={m.key} style={{ marginBottom: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ ...F, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: C.marbleInk }}>{m.label}</span>
                        <span style={{ fontFamily: "'Prata',serif", fontSize: 14, color: val !== 0 ? C.forestDark : C.inkFaint }}>
                          {val === 0 ? 'Standard' : `${val > 0 ? '+' : ''}${val} ${m.unit}`}
                        </span>
                      </div>
                      <div style={{ position: 'relative' }}>
                        <div style={{ height: 1, background: C.marbleLine, position: 'absolute', top: '50%', left: 0, right: 0 }} />
                        <input
                          type="range" min={m.min} max={m.max} step={m.step} value={val}
                          onChange={e => setFit(f => ({ ...f, [m.key]: parseFloat(e.target.value) }))}
                          style={{ width: '100%', appearance: 'none', background: 'transparent', cursor: 'pointer', position: 'relative', zIndex: 1, margin: 0 }}
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                        <span style={{ ...F, fontSize: 10, color: 'rgba(21,20,15,0.35)' }}>{m.min} cm</span>
                        <span style={{ ...F, fontSize: 10, color: 'rgba(21,20,15,0.35)' }}>+{m.max} cm</span>
                      </div>
                    </div>
                  )
                })}

                {Object.values(fit).some(v => v !== 0) && (
                  <button onClick={() => setFit(Object.fromEntries(FIT_MEASURES.map(m => [m.key, 0])))}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', ...F, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: C.inkFaint, textDecoration: 'underline', padding: 0 }}>
                    Reset to standard
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Add to bag */}
          <button
            onClick={handleAdd}
            style={{
              width: '100%', padding: '16px 0',
              background: added ? C.forestEmerald : C.forestDark,
              color: C.cream, border: 'none',
              ...F, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', fontWeight: 600,
              cursor: 'pointer', transition: 'background 0.3s',
            }}
          >
            {added ? '✓ Added to Bag' : 'Add to Bag →'}
          </button>

          {/* Care + Size guide */}
          <div style={{ marginTop: 32, display: 'flex', gap: 24 }}>
            <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', ...F, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: C.inkFaint, textDecoration: 'underline', padding: 0 }}>Size Guide</button>
            <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', ...F, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: C.inkFaint, textDecoration: 'underline', padding: 0 }}>Care & Materials</button>
          </div>
        </div>
      </div>

      <style>{`
        input[type='range']::-webkit-slider-thumb {
          appearance: none; width: 14px; height: 14px;
          background: ${C.marbleInk}; border-radius: 0; cursor: pointer;
        }
        input[type='range']::-moz-range-thumb {
          width: 14px; height: 14px;
          background: ${C.marbleInk}; border: none; border-radius: 0; cursor: pointer;
        }
        @media (max-width: 800px) {
          .product-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
