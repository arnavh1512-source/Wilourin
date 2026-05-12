'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useCartStore } from '@/lib/store'

const C = {
  bg:           '#ffffff',
  ink:          '#15140f',
  faint:        'rgba(21,20,15,0.45)',
  line:         'rgba(21,20,15,0.12)',
  forestDark:   '#0d2818',
  forestEmerald:'#1f4a30',
  cream:        '#e8e4d8',
}

interface Variant { id:string; size:string; stock_qty:number }
interface ProductImage { id:string; url:string; is_primary:boolean; display_order:number }
interface Product {
  id:string; name:string; slug:string; description?:string
  price:number; original_price?:number; badge?:string
  product_images:ProductImage[]
  product_variants:Variant[]
}

const FIT_MEASURES = [
  { key:'chest',  label:'Chest',  min:-6, max:6, step:0.5 },
  { key:'waist',  label:'Waist',  min:-6, max:6, step:0.5 },
  { key:'hips',   label:'Hips',   min:-6, max:6, step:0.5 },
  { key:'length', label:'Length', min:-4, max:4, step:0.5 },
]

export function ProductClient({ product }: { product:Product }) {
  const images   = [...product.product_images].sort((a,b) => a.display_order - b.display_order)
  const variants = product.product_variants ?? []

  const [activeImg, setActiveImg] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [fitOpen, setFitOpen]   = useState(false)
  const [fit, setFit] = useState<Record<string,number>>(() => Object.fromEntries(FIT_MEASURES.map(m => [m.key, 0])))
  const [added, setAdded]       = useState(false)
  const [error, setError]       = useState('')

  const add = useCartStore(s => s.add)

  const handleAdd = () => {
    if (!selectedSize) { setError('Please select a size'); return }
    const variant = variants.find(v => v.size === selectedSize)
    if (variant && variant.stock_qty === 0) { setError('Out of stock'); return }
    setError('')
    const hasCustomFit = Object.values(fit).some(v => v !== 0)
    add({ id:product.id, variantId:variant?.id, name:product.name, img:images[0]?.url ?? '', price:product.price, size:selectedSize, quantity:1, customFit:hasCustomFit ? fit : undefined })
    setAdded(true)
    setTimeout(() => setAdded(false), 2500)
  }

  const sizeAvailable = (size:string) => {
    const v = variants.find(x => x.size === size)
    return !v || v.stock_qty > 0
  }

  const F = { fontFamily:"'Raleway',sans-serif" }

  return (
    <div style={{ background:C.bg, minHeight:'100vh' }}>

      {/* ── Top bar ── */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 16px', position:'sticky', top:0, background:C.bg, zIndex:50, borderBottom:`1px solid ${C.line}` }}>
        <a href="/#collection" style={{ ...F, fontSize:18, color:C.ink, textDecoration:'none', lineHeight:1 }}>←</a>
        <div style={{ ...F, fontSize:9, letterSpacing:3, textTransform:'uppercase', color:C.faint }}>
          {activeImg + 1} / {images.length || 1}
        </div>
        <div style={{ display:'flex', gap:16 }}>
          <span style={{ fontSize:18, color:C.ink, cursor:'pointer' }}>♡</span>
          <span style={{ fontSize:18, color:C.ink, cursor:'pointer' }}>↑</span>
        </div>
      </div>

      {/* ── Images — full bleed stacked ── */}
      <div>
        {images.length > 0 ? images.map((img, i) => (
          <div key={img.id}
            onMouseEnter={() => setActiveImg(i)}
            style={{ position:'relative', aspectRatio:'2/3', background:'#f0ede8' }}>
            <Image
              src={img.url} alt={`${product.name} ${i+1}`} fill
              sizes="(max-width:900px) 100vw, 55vw"
              style={{ objectFit:'cover', objectPosition:'top center' }}
              priority={i === 0}
            />
            {/* TRY ON badge on first image */}
            {i === 0 && (
              <div style={{ position:'absolute', bottom:14, left:14, background:'rgba(255,255,255,0.9)', padding:'7px 12px', display:'flex', alignItems:'center', gap:6, cursor:'pointer' }}>
                <span style={{ fontSize:12 }}>✦</span>
                <span style={{ ...F, fontSize:9, letterSpacing:2, textTransform:'uppercase', color:C.ink }}>Personalize Fit</span>
              </div>
            )}
          </div>
        )) : (
          <div style={{ aspectRatio:'2/3', background:'#f0ede8' }} />
        )}
      </div>

      {/* ── Product info panel ── */}
      <div style={{ padding:'20px 16px 80px' }}>

        {product.badge && (
          <div style={{ ...F, fontSize:9, letterSpacing:2, textTransform:'uppercase', color:C.faint, marginBottom:6 }}>{product.badge}</div>
        )}

        <div style={{ ...F, fontSize:13, letterSpacing:0.5, textTransform:'uppercase', color:C.ink, lineHeight:1.4, marginBottom:4, fontWeight:400 }}>
          {product.name}
        </div>

        <div style={{ display:'flex', alignItems:'baseline', gap:8, marginBottom:4 }}>
          <span style={{ ...F, fontSize:14, color:C.ink }}>₹ {Number(product.price).toLocaleString('en-IN')}.00</span>
          {product.original_price && (
            <span style={{ ...F, fontSize:12, color:C.faint, textDecoration:'line-through' }}>₹ {Number(product.original_price).toLocaleString('en-IN')}.00</span>
          )}
        </div>

        <div style={{ ...F, fontSize:10, color:C.faint, marginBottom:20 }}>MRP incl. of all taxes</div>

        {product.description && (
          <p style={{ ...F, fontSize:12, color:'rgba(21,20,15,0.65)', lineHeight:1.7, marginBottom:20 }}>{product.description}</p>
        )}

        {/* Size selector */}
        <div style={{ marginBottom:16 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
            <span style={{ ...F, fontSize:10, letterSpacing:1.5, textTransform:'uppercase', color:C.ink }}>
              {selectedSize ? `Size — ${selectedSize}` : 'Select Size'}
            </span>
            <button style={{ ...F, fontSize:10, letterSpacing:1, textTransform:'uppercase', color:C.faint, textDecoration:'underline', background:'none', border:'none', cursor:'pointer', padding:0 }}>
              Size Guide
            </button>
          </div>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {['XS','S','M','L','XL','XXL'].map(size => {
              const available = variants.length === 0 || sizeAvailable(size)
              const active = selectedSize === size
              return (
                <button key={size} onClick={() => available && setSelectedSize(size)} disabled={!available}
                  style={{
                    height:40, minWidth:52, padding:'0 10px',
                    border:`1px solid ${active ? C.ink : C.line}`,
                    background: active ? C.ink : 'transparent',
                    color: active ? '#fff' : available ? C.ink : 'rgba(21,20,15,0.2)',
                    ...F, fontSize:11, letterSpacing:0.5,
                    cursor: available ? 'pointer' : 'not-allowed',
                    transition:'all 0.15s',
                    position:'relative', overflow:'hidden',
                  }}>
                  {size}
                  {!available && (
                    <div style={{ position:'absolute', inset:0, background:`linear-gradient(to top right, transparent calc(50% - 0.5px), rgba(21,20,15,0.12) 50%, transparent calc(50% + 0.5px))` }} />
                  )}
                </button>
              )
            })}
          </div>
          {error && <p style={{ ...F, fontSize:11, color:'#dc2626', marginTop:8 }}>{error}</p>}
        </div>

        {/* Personalized Fit accordion */}
        <div style={{ borderTop:`1px solid ${C.line}`, borderBottom:`1px solid ${C.line}`, marginBottom:20 }}>
          <button onClick={() => setFitOpen(!fitOpen)}
            style={{ width:'100%', padding:'14px 0', background:'transparent', border:'none', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ ...F, fontSize:10, letterSpacing:2, textTransform:'uppercase', color:C.ink }}>Personalized Fit</span>
            <span style={{ ...F, fontSize:18, color:C.faint, lineHeight:1 }}>{fitOpen ? '−' : '+'}</span>
          </button>
          {fitOpen && (
            <div style={{ paddingBottom:18 }}>
              <p style={{ ...F, fontSize:11, color:C.faint, marginBottom:16, lineHeight:1.65 }}>
                Adjust centimetres from your standard size. We tailor each piece accordingly.
              </p>
              {FIT_MEASURES.map(m => {
                const val = fit[m.key]
                return (
                  <div key={m.key} style={{ marginBottom:16 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                      <span style={{ ...F, fontSize:10, letterSpacing:1.5, textTransform:'uppercase', color:C.ink }}>{m.label}</span>
                      <span style={{ ...F, fontSize:11, color: val!==0 ? C.forestEmerald : C.faint }}>
                        {val===0 ? 'Standard' : `${val>0?'+':''}${val} cm`}
                      </span>
                    </div>
                    <div style={{ position:'relative', height:20, display:'flex', alignItems:'center' }}>
                      <div style={{ position:'absolute', left:0, right:0, height:1, background:C.line }} />
                      <input type="range" min={m.min} max={m.max} step={m.step} value={val}
                        onChange={e => setFit(f => ({ ...f, [m.key]: parseFloat(e.target.value) }))}
                        style={{ width:'100%', appearance:'none', background:'transparent', cursor:'pointer', position:'relative', zIndex:1, margin:0 }} />
                    </div>
                  </div>
                )
              })}
              {Object.values(fit).some(v => v!==0) && (
                <button onClick={() => setFit(Object.fromEntries(FIT_MEASURES.map(m => [m.key,0])))}
                  style={{ ...F, fontSize:9, letterSpacing:1.5, textTransform:'uppercase', color:C.faint, textDecoration:'underline', background:'none', border:'none', cursor:'pointer', padding:0 }}>
                  Reset
                </button>
              )}
            </div>
          )}
        </div>

        {/* ADD button — outlined style like Zara */}
        <button onClick={handleAdd}
          style={{
            width:'100%', padding:'15px 0',
            background: added ? C.forestDark : 'transparent',
            color: added ? C.cream : C.ink,
            border: `1px solid ${added ? C.forestDark : C.ink}`,
            ...F, fontSize:11, letterSpacing:3, textTransform:'uppercase',
            cursor:'pointer', transition:'all 0.25s', marginBottom:12,
          }}>
          {added ? '✓ ADDED' : 'ADD'}
        </button>

        {/* Care info */}
        <div style={{ borderTop:`1px solid ${C.line}`, paddingTop:16, marginTop:8 }}>
          <button style={{ ...F, fontSize:10, letterSpacing:1.5, textTransform:'uppercase', color:C.faint, textDecoration:'none', background:'none', border:'none', cursor:'pointer', padding:'8px 0', display:'flex', justifyContent:'space-between', width:'100%' }}>
            <span>Care & Materials</span><span>+</span>
          </button>
          <button style={{ ...F, fontSize:10, letterSpacing:1.5, textTransform:'uppercase', color:C.faint, background:'none', border:'none', cursor:'pointer', padding:'8px 0', display:'flex', justifyContent:'space-between', width:'100%', borderTop:`1px solid ${C.line}` }}>
            <span>Shipping & Returns</span><span>+</span>
          </button>
        </div>
      </div>

      <style>{`
        input[type='range']::-webkit-slider-thumb { appearance:none; width:12px; height:12px; background:${C.ink}; border-radius:0; cursor:pointer; }
        input[type='range']::-moz-range-thumb { width:12px; height:12px; background:${C.ink}; border:none; border-radius:0; cursor:pointer; }
        @media (min-width: 900px) {
          .pdp-layout { display: grid; grid-template-columns: 55% 45%; align-items: start; }
        }
      `}</style>
    </div>
  )
}
