'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const C = {
  bg:      '#ffffff',
  ink:     '#15140f',
  faint:   'rgba(21,20,15,0.45)',
  line:    'rgba(21,20,15,0.1)',
  pill:    '#f4f1ec',
}

const FILTERS = ['VIEW ALL', 'NEW', 'DRESSES', 'TOPS', 'BLAZERS', 'TROUSERS', 'KNITWEAR', 'CO-ORD SETS']

const FALLBACK = [
  { id:'f1', name:'LIMITED EDITION OVERSIZED BLAZER', slug:null, price:4200, original_price:null, badge:'NEW', product_images:[
    { url:'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80', is_primary:true,  display_order:0 },
    { url:'https://images.unsplash.com/photo-1554412933-514a83d2f3cc?w=800&q=80',    is_primary:false, display_order:1 },
  ]},
  { id:'f2', name:'BIAS CUT MIDI DRESS', slug:null, price:2950, original_price:null, badge:null, product_images:[
    { url:'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80', is_primary:true,  display_order:0 },
    { url:'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=800&q=80', is_primary:false, display_order:1 },
  ]},
  { id:'f3', name:'LINEN COLUMN DRESS', slug:null, price:5600, original_price:6800, badge:null, product_images:[
    { url:'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&q=80', is_primary:true,  display_order:0 },
    { url:'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80', is_primary:false, display_order:1 },
  ]},
  { id:'f4', name:'SILK WRAP TOP', slug:null, price:3400, original_price:null, badge:null, product_images:[
    { url:'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=800&q=80', is_primary:true,  display_order:0 },
    { url:'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=800&q=80', is_primary:false, display_order:1 },
  ]},
  { id:'f5', name:'TAILORED WIDE-LEG TROUSER', slug:null, price:3800, original_price:null, badge:null, product_images:[
    { url:'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80', is_primary:true,  display_order:0 },
    { url:'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80', is_primary:false, display_order:1 },
  ]},
  { id:'f6', name:'OPEN BACK MIDI DRESS', slug:null, price:6200, original_price:7400, badge:'LIMITED', product_images:[
    { url:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80', is_primary:true,  display_order:0 },
    { url:'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80', is_primary:false, display_order:1 },
  ]},
]

interface ProductImage { url:string; is_primary:boolean; display_order:number }
interface Product { id:string; name:string; slug:string|null; price:number; original_price?:number|null; badge?:string|null; product_images?:ProductImage[] }

function ProductCard({ p, fullWidth = false }: { p:Product; fullWidth?:boolean }) {
  const [hover, setHover] = useState(false)
  const sorted = [...(p.product_images ?? [])].sort((a,b) => a.display_order - b.display_order)
  const img1 = sorted[0]?.url ?? 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80'
  const img2 = sorted[1]?.url ?? null

  const inner = (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      {/* Image container */}
      <div style={{ position:'relative', aspectRatio: fullWidth ? '3/2' : '2/3', overflow:'hidden', background:'#f0ede8', cursor:'pointer' }}>
        <Image
          src={img1} alt={p.name} fill
          sizes={fullWidth ? '100vw' : '(max-width:600px) 50vw, 33vw'}
          style={{ objectFit:'cover', objectPosition:'top center', transition:'transform 1.2s cubic-bezier(.2,.8,.2,1)', transform: hover && !img2 ? 'scale(1.03)' : 'scale(1)' }}
          priority={fullWidth}
        />
        {img2 && (
          <Image
            src={img2} alt={p.name} fill
            sizes={fullWidth ? '100vw' : '(max-width:600px) 50vw, 33vw'}
            style={{ objectFit:'cover', objectPosition:'top center', opacity: hover ? 1 : 0, transition:'opacity 0.45s ease' }}
          />
        )}
        {p.badge && (
          <div style={{ position:'absolute', top:10, left:10, fontFamily:"'Raleway',sans-serif", fontSize:8, letterSpacing:2, textTransform:'uppercase', color:C.ink, background:'rgba(255,255,255,0.88)', padding:'3px 7px' }}>
            {p.badge}
          </div>
        )}
      </div>

      {/* Info row — always visible, below image */}
      <div style={{ padding:'8px 4px 12px', display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8 }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontFamily:"'Raleway',sans-serif", fontSize:10, letterSpacing:1, textTransform:'uppercase', color:C.ink, lineHeight:1.3, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', fontWeight:400 }}>
            {p.name}
          </div>
          <div style={{ marginTop:3, display:'flex', alignItems:'baseline', gap:6 }}>
            <span style={{ fontFamily:"'Raleway',sans-serif", fontSize:12, color:C.ink }}>
              ₹ {Number(p.price).toLocaleString('en-IN')}.00
            </span>
            {p.original_price && (
              <span style={{ fontFamily:"'Raleway',sans-serif", fontSize:11, color:C.faint, textDecoration:'line-through' }}>
                ₹ {Number(p.original_price).toLocaleString('en-IN')}.00
              </span>
            )}
          </div>
        </div>
        {/* Quick-add "+" button */}
        <button
          onClick={e => { e.preventDefault(); e.stopPropagation() }}
          style={{ width:28, height:28, border:`1px solid ${C.line}`, background:'transparent', cursor:'pointer', fontFamily:"'Raleway',sans-serif", fontSize:16, color:C.ink, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'background 0.2s', lineHeight:1 }}
          onMouseEnter={e => { e.currentTarget.style.background = C.ink; e.currentTarget.style.color = '#fff' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.ink }}
          aria-label="Quick add"
        >+</button>
      </div>
    </div>
  )

  if (p.slug) return <Link href={`/products/${p.slug}`} style={{ display:'block', textDecoration:'none', color:'inherit' }}>{inner}</Link>
  return inner
}

export function ProductsSection({ products }: { products:Product[] }) {
  const [activeFilter, setActiveFilter] = useState('VIEW ALL')
  const all = products.length > 0 ? products : FALLBACK

  return (
    <section id="collection" style={{ background: C.bg }}>

      {/* Collection title */}
      <div style={{ padding:'40px 16px 0', textAlign:'center' }}>
        <div style={{ fontFamily:"'Raleway',sans-serif", fontSize:9, letterSpacing:3, textTransform:'uppercase', color:C.faint }}>
          Wilourin Studio Collection
        </div>
      </div>

      {/* Filter pills — horizontal scroll */}
      <div style={{ overflowX:'auto', whiteSpace:'nowrap', padding:'16px 16px 0', scrollbarWidth:'none' }} className="no-scrollbar">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setActiveFilter(f)}
            style={{
              display:'inline-block', marginRight:6, padding:'7px 14px',
              fontFamily:"'Raleway',sans-serif", fontSize:9, letterSpacing:2, textTransform:'uppercase',
              border:`1px solid ${activeFilter===f ? C.ink : C.line}`,
              background: activeFilter===f ? C.ink : 'transparent',
              color: activeFilter===f ? '#fff' : C.ink,
              cursor:'pointer', whiteSpace:'nowrap', transition:'all 0.15s',
            }}>
            {f}
          </button>
        ))}
      </div>

      {/* GRID */}
      <div style={{ padding:'16px 2px 2px' }}>
        {buildRows(all).map((row, ri) =>
          row.length === 1 ? (
            // Full-width featured row
            <div key={ri} style={{ marginBottom:2 }}>
              <ProductCard p={row[0]} fullWidth />
            </div>
          ) : (
            // 2-col row (desktop: up to 3-col)
            <div key={ri} className="product-row" style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:2, marginBottom:2 }}>
              {row.map(p => <ProductCard key={p.id} p={p} />)}
            </div>
          )
        )}
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display:none; }
        @media (min-width: 900px) {
          .product-row { grid-template-columns: repeat(3,1fr) !important; }
        }
      `}</style>
    </section>
  )
}

// Build rows: every 5th product goes full-width, rest in 2-col pairs
function buildRows(products: Product[]): Product[][] {
  const rows: Product[][] = []
  let i = 0
  let turn = 0 // every 3 pairs, insert a full-width
  while (i < products.length) {
    if (turn === 2 && i + 1 <= products.length) {
      rows.push([products[i]])
      i++
      turn = 0
    } else {
      rows.push(products.slice(i, i + 2))
      i += 2
      turn++
    }
  }
  return rows.filter(r => r.length > 0)
}
