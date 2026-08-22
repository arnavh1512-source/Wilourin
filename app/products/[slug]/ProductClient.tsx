'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/lib/store'
import { FIT_BOUNDS, FIT_KEYS, FIT_LABELS } from '@/lib/fitBounds'

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

const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

// Bounds are shared with the checkout validation schema so the two cannot drift.
const FIT_MEASURES = FIT_KEYS.map(key => ({
  key,
  label: FIT_LABELS[key],
  unit: 'cm',
  ...FIT_BOUNDS[key],
}))

export function ProductClient({ product }: { product: Product }) {
  const images = useMemo(
    () => [...product.product_images].sort((a, b) => a.display_order - b.display_order),
    [product.product_images]
  )
  const variants = useMemo(() => product.product_variants ?? [], [product.product_variants])

  const [activeImg, setActiveImg] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [fitOpen, setFitOpen] = useState(true)
  const [fit, setFit] = useState<Record<string, number>>(() => Object.fromEntries(FIT_MEASURES.map(m => [m.key, 0])))
  const [added, setAdded] = useState(false)
  const [error, setError] = useState('')

  const add = useCartStore(s => s.add)

  // Every stored variant is selectable, whatever its label. Known sizes keep
  // their canonical order; custom labels ("One Size", "38"…) follow, sorted (H5).
  const availableSizes = useMemo(() => {
    const labels = [...new Set(variants.map(v => v.size))]
    const known = SIZE_ORDER.filter(s => labels.includes(s))
    const custom = labels.filter(s => !SIZE_ORDER.includes(s)).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    return [...known, ...custom]
  }, [variants])

  const primaryImage = images.find(img => img.is_primary)?.url ?? images[0]?.url ?? ''
  const purchasable = variants.length > 0

  const handleAdd = () => {
    // Checkout requires an inventory-bearing variant for every line, so a
    // product with no variants cannot be bought at all (H3).
    if (!purchasable) { setError('This piece is not available to order right now.'); return }
    if (!selectedSize) { setError('Please select a size'); return }
    const variant = variants.find(v => v.size === selectedSize)
    if (!variant) { setError('Please select a size'); return }
    if (variant.stock_qty === 0) { setError('This size is out of stock'); return }
    setError('')

    const activeFit = Object.fromEntries(Object.entries(fit).filter(([, v]) => v !== 0))
    add({
      id: product.id,
      variantId: variant.id,
      name: product.name,
      img: primaryImage,
      price: product.price,
      size: variant.size,
      quantity: 1,
      customFit: Object.keys(activeFit).length > 0 ? activeFit : undefined,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const F = { fontFamily: "'Raleway',sans-serif" }
  const fmt = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })
  const sizeAvailable = (size: string) => {
    const v = variants.find(x => x.size === size)
    return !v || v.stock_qty > 0
  }

  return (
    <div style={{ minHeight: '100vh', background: C.marbleBase }}>
      {/* Back nav + image counter */}
      <div style={{ padding: '20px 40px', borderBottom: `1px solid ${C.marbleLine}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/#collection" style={{ ...F, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: C.inkFaint, textDecoration: 'none' }}>← The Collection</Link>
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
            <span style={{ fontFamily: "'Prata',serif", fontSize: 28, color: C.marbleInk }}>{fmt.format(product.price)}</span>
            {product.original_price && (
              <span style={{ ...F, fontSize: 16, color: C.inkFaint, textDecoration: 'line-through' }}>{fmt.format(product.original_price)}</span>
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
              {!purchasable ? (
                <span style={{ ...F, fontSize: 11, color: C.inkFaint }}>Currently unavailable</span>
              ) : availableSizes.map(size => {
                const available = sizeAvailable(size)
                const active = selectedSize === size
                return (
                  <button
                    key={size}
                    onClick={() => { if (!available) return; setSelectedSize(size); setError('') }}
                    disabled={!available}
                    aria-pressed={active}
                    aria-label={`Size ${size}${!available ? ' out of stock' : active ? ' selected' : ''}`}
                    style={{
                      minWidth: 52, height: 52, padding: '0 12px',
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
                  Use the sliders to add or remove centimetres from your standard size. We&rsquo;ll tailor accordingly.
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
                          aria-label={`${m.label} adjustment in centimetres`}
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
            disabled={!purchasable}
            style={{
              width: '100%', padding: '16px 0',
              background: !purchasable ? C.inkFaint : added ? C.forestEmerald : C.forestDark,
              color: C.cream, border: 'none',
              ...F, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', fontWeight: 600,
              cursor: purchasable ? 'pointer' : 'not-allowed', transition: 'background 0.3s',
            }}
          >
            {!purchasable ? 'Currently Unavailable' : added ? '✓ Added to Bag' : 'Add to Bag →'}
          </button>

          {/* Care + Size guide */}
          <div style={{ marginTop: 32, display: 'flex', gap: 24 }}>
            <Link href="/size-guide" style={{ background: 'transparent', border: 'none', cursor: 'pointer', ...F, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: C.inkFaint, textDecoration: 'underline', padding: 0 }}>Size Guide</Link>
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
