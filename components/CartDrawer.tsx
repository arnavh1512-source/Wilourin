'use client'

import Image from 'next/image'
import { useCartStore } from '@/lib/store'

const C = {
  marbleBase:    '#f4f1ec',
  marbleInk:     '#15140f',
  marbleInkFaint:'rgba(21,20,15,0.58)',
  marbleLine:    'rgba(21,20,15,0.22)',
  forestDark:    '#0d2818',
  cream:         '#e8e4d8',
  forestEmerald: '#1f4a30',
}

export function CartDrawer() {
  const { isOpen, close, items, remove } = useCartStore()

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={close}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.5)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.3s',
          zIndex: 200,
        }}
      />

      {/* Drawer */}
      <aside style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 440, maxWidth: '92vw',
        backgroundColor: C.marbleBase,
        borderLeft: `1px solid ${C.marbleLine}`,
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.45s cubic-bezier(.2,.8,.2,1)',
        zIndex: 201,
        color: C.marbleInk,
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ padding: '28px 32px', borderBottom: `1px solid ${C.marbleLine}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 10, letterSpacing: 2.5, color: C.marbleInkFaint }}>
              YOUR BAG · {String(items.length).padStart(2, '0')}
            </div>
            <div style={{ fontFamily: "'Prata',serif", fontSize: 26, marginTop: 4 }}>Holding</div>
          </div>
          <button
            onClick={close}
            style={{ background: 'transparent', border: 'none', color: C.marbleInk, fontSize: 22, cursor: 'pointer' }}
            aria-label="Close cart"
          >✕</button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflow: 'auto', padding: '12px 32px' }}>
          {items.length === 0 && (
            <div style={{ padding: '60px 0', textAlign: 'center', fontFamily: "'Prata',serif", fontStyle: 'italic', fontSize: 22, color: C.marbleInkFaint }}>
              Nothing here, <span style={{ color: C.forestEmerald }}>yet.</span>
            </div>
          )}
          {items.map((it, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 18, padding: '20px 0', borderBottom: `1px solid ${C.marbleLine}`, alignItems: 'start' }}>
              <div style={{ height: 100, background: '#fafaf7', border: `1px solid ${C.marbleLine}`, overflow: 'hidden', position: 'relative' }}>
                <Image src={it.img} alt={it.name} fill style={{ objectFit: 'cover', objectPosition: 'top' }} sizes="80px" />
              </div>
              <div>
                <div style={{ fontFamily: "'Prata',serif", fontSize: 18, marginTop: 4 }}>{it.name}</div>
                <button
                  onClick={() => remove(i)}
                  style={{ background: 'transparent', border: 'none', color: C.marbleInkFaint, fontFamily: "'Raleway',sans-serif", fontSize: 9, letterSpacing: 1.5, marginTop: 10, padding: 0, cursor: 'pointer', textTransform: 'uppercase', fontWeight: 600, textDecoration: 'underline' }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Checkout */}
        <div style={{ padding: '24px 32px', borderTop: `1px solid ${C.marbleLine}` }}>
          <button style={{ width: '100%', padding: '16px 0', background: C.forestDark, color: C.cream, border: 'none', fontFamily: "'Raleway',sans-serif", fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', cursor: 'pointer', fontWeight: 600 }}>
            Proceed to checkout →
          </button>
        </div>
      </aside>
    </>
  )
}
