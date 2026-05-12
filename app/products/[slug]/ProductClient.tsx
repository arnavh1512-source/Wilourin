'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useCartStore } from '@/lib/store'

const C = {
  marbleBase:    '#f4f1ec',
  marbleInk:     '#15140f',
  marbleLine:    'rgba(21,20,15,0.15)',
  forestDark:    '#0d2818',
  forestEmerald: '#1f4a30',
  cream:         '#e8e4d8',
  inkFaint:      'rgba(21,20,15,0.5)',
  inkSoft:       'rgba(21,20,15,0.75)',
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

  const [selectedSize, setSelectedSize] = useState('')
  const [fitOpen, setFitOpen]   = useState(false)
  const [fit, setFit] = useState<Record<string, number>>(() => Object.fromEntries(FIT_MEASURES.map(m => [m.key, 0])))
  const [added, setAdded]       = useState(false)
  const [error, setError]       = useState('')

  const add = useCartStore(s => s.add)

  const handleAdd = () => {
    if (!selectedSize) { setError('Please select a size'); return }
    const variant = variants.find(v => v.size === selectedSize)
    if (variant && variant.stock_qty === 0) { setError('Out of stock'); return }
    setError('')
    const hasCustomFit = Object.values(fit).some(v => v !== 0)
    add({ id: product.id, variantId: variant?.id, name: product.name, img: images[0]?.url ?? '', price: product.price, size: selectedSize, quantity: 1, customFit: hasCustomFit ? fit : undefined })
    setAdded(true)
    setTimeout(() => setAdded(false), 2500)
  }

  const sizeAvailable = (size: string) => {
    const v = variants.find(x => x.size === size)
    return !v || v.stock_qty > 0
  }

  const F = { fontFamily: "'Raleway',sans-serif" }

  return (
    <div style={{ background: C.marbleBase, minHeight: '100vh' }}>
      <div className="pdp-layout" style={{ display: 'grid', gridTemplateColumns: '60% 40%', alignItems: 'start' }}>

        {/* ── LEFT: stacked editorial images ─────────────────────── */}
        <div>
          {/* Back link overlaid on first image */}
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
              <a href="/#collection" style={{ ...F, fontSize: 9, letterSpacing: 2.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)', textDecoration: 'none', background: 'rgba(0,0,0,0.25)', padding: '6px 12px', backdropFilter: 'blur(4px)' }}>
                ← Back
              </a>
            </div>
            {images.length > 0 ? (
              images.map((img, i) => (
                <div key={img.id} style={{ position: 'relative', aspectRatio: '2/3', background: '#ede9e2' }}>
                  <Image
                    src={img.url} alt={`${product.name} ${i + 1}`} fill
                    sizes="(max-width: 800px) 100vw, 60vw"
                    style={{ objectFit: 'cover', objectPosition: 'top center' }}
                    priority={i === 0}
                  />
                </div>
              ))
            ) : (
              <div style={{ aspectRatio: '2/3', background: '#ede9e2' }} />
            )}
          </div>
        </div>

        {/* ── RIGHT: sticky product panel ────────────────────────── */}
        <div className="pdp-panel" style={{ position: 'sticky', top: 0, height: '100vh', overflowY: 'auto', padding: '48px 40px 48px 32px', display: 'flex', flexDirection: 'column' }}>

          {product.badge && (
            <div style={{ display: 'inline-block', ...F, fontSize: 9, letterSpacing: 2.5, textTransform: 'uppercase', color: C.marbleInk, border: `1px solid ${C.marbleLine}`, padding: '4px 10px', marginBottom: 20, alignSelf: 'flex-start' }}>
              {product.badge}
            </div>
          )}

          <h1 style={{ fontFamily: "'Prata',serif", fontSize: 'clamp(26px,3vw,38px)', color: C.marbleInk, fontWeight: 400, lineHeight: 1.1, margin: '0 0 12px' }}>
            {product.name}
          </h1>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 20 }}>
            <span style={{ fontFamily: "'Prata',serif", fontSize: 22, color: C.marbleInk }}>₹{Number(product.price).toLocaleString('en-IN')}</span>
            {product.original_price && (
              <span style={{ ...F, fontSize: 14, color: C.inkFaint, textDecoration: 'line-through' }}>₹{Number(product.original_price).toLocaleString('en-IN')}</span>
            )}
          </div>

          {product.description && (
            <p style={{ ...F, fontSize: 13, color: C.inkSoft, lineHeight: 1.75, marginBottom: 28 }}>{product.description}</p>
          )}

          <div style={{ height: 1, background: C.marbleLine, marginBottom: 28 }} />

          {/* Size selector */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ ...F, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: C.inkFaint }}>
                Size {selectedSize && <span style={{ color: C.marbleInk, fontWeight: 700 }}>— {selectedSize}</span>}
              </span>
              <button style={{ ...F, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: C.inkFaint, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                Size guide
              </button>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => {
                const available = variants.length === 0 || sizeAvailable(size)
                const active = selectedSize === size
                return (
                  <button key={size} onClick={() => available && setSelectedSize(size)} disabled={!available}
                    style={{
                      minWidth: 48, height: 48, padding: '0 8px',
                      border: `1px solid ${active ? C.marbleInk : C.marbleLine}`,
                      background: active ? C.marbleInk : 'transparent',
                      color: active ? C.cream : available ? C.marbleInk : 'rgba(21,20,15,0.22)',
                      ...F, fontSize: 11, letterSpacing: 1,
                      cursor: available ? 'pointer' : 'not-allowed',
                      transition: 'all 0.15s',
                      position: 'relative',
                    }}
                  >
                    {size}
                    {!available && (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '100%', height: 1, background: 'rgba(21,20,15,0.15)', transform: 'rotate(-45deg)' }} />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
            {error && <p style={{ ...F, fontSize: 11, color: '#dc2626', margin: '8px 0 0' }}>{error}</p>}
          </div>

          {/* Personalized Fit */}
          <div style={{ borderTop: `1px solid ${C.marbleLine}`, borderBottom: `1px solid ${C.marbleLine}`, marginBottom: 24 }}>
            <button onClick={() => setFitOpen(!fitOpen)}
              style={{ width: '100%', padding: '16px 0', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ ...F, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: C.marbleInk }}>Personalized Fit</span>
              <span style={{ ...F, fontSize: 20, color: C.inkFaint, lineHeight: 1 }}>{fitOpen ? '−' : '+'}</span>
            </button>

            {fitOpen && (
              <div style={{ paddingBottom: 20 }}>
                <p style={{ ...F, fontSize: 12, color: C.inkFaint, marginBottom: 18, lineHeight: 1.65 }}>
                  Adjust centimetres from your standard size. We tailor each piece accordingly.
                </p>
                {FIT_MEASURES.map(m => {
                  const val = fit[m.key]
                  return (
                    <div key={m.key} style={{ marginBottom: 18 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ ...F, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: C.marbleInk }}>{m.label}</span>
                        <span style={{ fontFamily: "'Prata',serif", fontSize: 13, color: val !== 0 ? C.forestDark : C.inkFaint }}>
                          {val === 0 ? 'Standard' : `${val > 0 ? '+' : ''}${val} cm`}
                        </span>
                      </div>
                      <div style={{ position: 'relative', height: 20, display: 'flex', alignItems: 'center' }}>
                        <div style={{ position: 'absolute', left: 0, right: 0, height: 1, background: C.marbleLine }} />
                        <input type="range" min={m.min} max={m.max} step={m.step} value={val}
                          onChange={e => setFit(f => ({ ...f, [m.key]: parseFloat(e.target.value) }))}
                          style={{ width: '100%', appearance: 'none', background: 'transparent', cursor: 'pointer', position: 'relative', zIndex: 1, margin: 0 }}
                        />
                      </div>
                    </div>
                  )
                })}
                {Object.values(fit).some(v => v !== 0) && (
                  <button onClick={() => setFit(Object.fromEntries(FIT_MEASURES.map(m => [m.key, 0])))}
                    style={{ ...F, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: C.inkFaint, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: 4 }}>
                    Reset
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Add to bag */}
          <button onClick={handleAdd}
            style={{
              width: '100%', padding: '15px 0',
              background: added ? C.forestEmerald : C.marbleInk,
              color: C.cream, border: 'none',
              ...F, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', fontWeight: 600,
              cursor: 'pointer', transition: 'background 0.3s', marginBottom: 12,
            }}>
            {added ? '✓ Added to Bag' : 'Add to Bag'}
          </button>

          <a href="/#collection" style={{ display: 'block', textAlign: 'center', ...F, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: C.inkFaint, textDecoration: 'none', padding: '10px 0', border: `1px solid ${C.marbleLine}` }}>
            Continue Shopping
          </a>

          <div style={{ marginTop: 'auto', paddingTop: 32, display: 'flex', gap: 20 }}>
            <button style={{ ...F, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: C.inkFaint, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Care & Materials</button>
          </div>
        </div>
      </div>

      <style>{`
        input[type='range']::-webkit-slider-thumb {
          appearance: none; width: 13px; height: 13px;
          background: ${C.marbleInk}; border-radius: 0; cursor: pointer;
        }
        input[type='range']::-moz-range-thumb {
          width: 13px; height: 13px; background: ${C.marbleInk}; border: none; border-radius: 0; cursor: pointer;
        }
        @media (max-width: 800px) {
          .pdp-layout { grid-template-columns: 1fr !important; }
          .pdp-panel { position: static !important; height: auto !important; padding: 32px 20px 48px !important; }
        }
      `}</style>
    </div>
  )
}
