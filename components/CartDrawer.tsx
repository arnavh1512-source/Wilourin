'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/lib/store'

const C = {
  marbleBase:     '#f4f1ec',
  marbleInk:      '#15140f',
  marbleInkFaint: 'rgba(21,20,15,0.58)',
  marbleLine:     'rgba(21,20,15,0.22)',
  forestDark:     '#0d2818',
  cream:          '#e8e4d8',
  forestEmerald:  '#1f4a30',
}

export function CartDrawer() {
  const { isOpen, close, items, remove, updateQty, getTotal } = useCartStore()
  const router = useRouter()
  const total = getTotal()
  const itemCount = items.reduce((s, it) => s + it.quantity, 0)

  const goCheckout = () => {
    close()
    router.push('/checkout')
  }

  return (
    <>
      <div onClick={close} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none', transition: 'opacity 0.3s', zIndex: 200 }} />

      <aside style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 440, maxWidth: '92vw',
        backgroundColor: C.marbleBase,
        borderLeft: `1px solid ${C.marbleLine}`,
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.45s cubic-bezier(.2,.8,.2,1)',
        zIndex: 201, color: C.marbleInk, display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ padding: '28px 32px', borderBottom: `1px solid ${C.marbleLine}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 10, letterSpacing: 2.5, color: C.marbleInkFaint }}>
              YOUR BAG · {String(itemCount).padStart(2, '0')}
            </div>
            <div style={{ fontFamily: "'Prata',serif", fontSize: 26, marginTop: 4 }}>Holding</div>
          </div>
          <button onClick={close} style={{ background: 'transparent', border: 'none', color: C.marbleInk, fontSize: 22, cursor: 'pointer' }} aria-label="Close">✕</button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflow: 'auto', padding: '12px 32px' }}>
          {items.length === 0 ? (
            <div style={{ padding: '60px 0', textAlign: 'center', fontFamily: "'Prata',serif", fontStyle: 'italic', fontSize: 22, color: C.marbleInkFaint }}>
              Nothing here, <span style={{ color: C.forestEmerald }}>yet.</span>
            </div>
          ) : items.map((it, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 18, padding: '20px 0', borderBottom: `1px solid ${C.marbleLine}`, alignItems: 'start' }}>
              <div style={{ height: 120, background: '#fafaf7', border: `1px solid ${C.marbleLine}`, overflow: 'hidden', position: 'relative' }}>
                <Image src={it.img} alt={it.name} fill style={{ objectFit: 'cover', objectPosition: 'top' }} sizes="80px" />
              </div>
              <div>
                <div style={{ fontFamily: "'Prata',serif", fontSize: 17, marginTop: 2, lineHeight: 1.2 }}>{it.name}</div>
                <div style={{ display: 'flex', gap: 12, marginTop: 4, alignItems: 'center' }}>
                  <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: 10, letterSpacing: 1.5, color: C.marbleInkFaint, textTransform: 'uppercase' }}>Size {it.size}</span>
                  {it.customFit && Object.values(it.customFit).some(v => v !== 0) && (
                    <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: 9, letterSpacing: 1, color: C.forestEmerald, textTransform: 'uppercase', border: `1px solid ${C.forestEmerald}`, padding: '2px 6px' }}>Custom Fit</span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${C.marbleLine}` }}>
                    <button onClick={() => updateQty(i, it.quantity - 1)} style={{ width: 28, height: 28, background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: "'Raleway',sans-serif", fontSize: 14, color: C.marbleInk }}>−</button>
                    <span style={{ width: 28, textAlign: 'center', fontFamily: "'Raleway',sans-serif", fontSize: 13, color: C.marbleInk }}>{it.quantity}</span>
                    <button onClick={() => updateQty(i, it.quantity + 1)} style={{ width: 28, height: 28, background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: "'Raleway',sans-serif", fontSize: 14, color: C.marbleInk }}>+</button>
                  </div>
                  <span style={{ fontFamily: "'Prata',serif", fontSize: 16, color: C.marbleInk }}>₹{(it.price * it.quantity).toLocaleString('en-IN')}</span>
                </div>
                <button onClick={() => remove(i)} style={{ background: 'transparent', border: 'none', color: C.marbleInkFaint, fontFamily: "'Raleway',sans-serif", fontSize: 9, letterSpacing: 1.5, marginTop: 8, padding: 0, cursor: 'pointer', textTransform: 'uppercase', textDecoration: 'underline' }}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding: '24px 32px', borderTop: `1px solid ${C.marbleLine}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
              <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: C.marbleInkFaint }}>Subtotal</span>
              <span style={{ fontFamily: "'Prata',serif", fontSize: 22, color: C.marbleInk }}>₹{total.toLocaleString('en-IN')}</span>
            </div>
            <p style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, color: C.marbleInkFaint, marginBottom: 16, lineHeight: 1.5 }}>
              Shipping calculated at checkout.
            </p>
            <button onClick={goCheckout} style={{ width: '100%', padding: '16px 0', background: C.forestDark, color: C.cream, border: 'none', fontFamily: "'Raleway',sans-serif", fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', cursor: 'pointer', fontWeight: 600 }}>
              Proceed to Checkout →
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
