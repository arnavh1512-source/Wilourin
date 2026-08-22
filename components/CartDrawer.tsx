'use client'

import { useCallback, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/lib/store'
import { shippingFor } from '@/lib/shipping'
import { useShippingSettings } from '@/lib/useShippingSettings'

const C = {
  marbleBase:     '#f4f1ec',
  marbleInk:      '#15140f',
  marbleInkFaint: 'rgba(21,20,15,0.58)',
  marbleLine:     'rgba(21,20,15,0.22)',
  forestDark:     '#0d2818',
  cream:          '#e8e4d8',
  forestEmerald:  '#1f4a30',
}

const fmt = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'

export function CartDrawer() {
  const { isOpen, close, items, remove, updateQty, getTotal, getCount } = useCartStore()
  const router = useRouter()
  const subtotal = getTotal()
  const itemCount = getCount()
  const shippingSettings = useShippingSettings()
  const shippingCost = shippingFor(subtotal, shippingSettings)

  const panelRef = useRef<HTMLElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const restoreRef = useRef<HTMLElement | null>(null)

  // Modal semantics: trap Tab inside the drawer, close on Escape, and hand
  // focus back to whatever opened it (L1).
  useEffect(() => {
    if (!isOpen) return
    restoreRef.current = document.activeElement as HTMLElement | null
    closeRef.current?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); close(); return }
      if (e.key !== 'Tab') return
      const panel = panelRef.current
      if (!panel) return
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (!panel.contains(document.activeElement)) { e.preventDefault(); first.focus() }
      else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      restoreRef.current?.focus?.()
    }
  }, [isOpen, close])

  const goCheckout = useCallback(() => { close(); router.push('/checkout') }, [close, router])

  return (
    <>
      <div
        onClick={close}
        aria-hidden="true"
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none', transition: 'opacity 0.3s', zIndex: 200 }}
      />

      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
        /* A closed drawer is removed from the tab order and the a11y tree (L1). */
        inert={!isOpen}
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: 440, maxWidth: '92vw',
          backgroundColor: C.marbleBase,
          borderLeft: `1px solid ${C.marbleLine}`,
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.45s cubic-bezier(.2,.8,.2,1)',
          zIndex: 201, color: C.marbleInk, display: 'flex', flexDirection: 'column',
        }}
      >
        <div style={{ padding: '28px 32px', borderBottom: `1px solid ${C.marbleLine}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 10, letterSpacing: 2.5, color: C.marbleInkFaint }}>
              YOUR BAG · {String(itemCount).padStart(2, '0')}
            </div>
            <div style={{ fontFamily: "'Prata',serif", fontSize: 26, marginTop: 4 }}>Holding</div>
          </div>
          <button ref={closeRef} onClick={close} style={{ background: 'transparent', border: 'none', color: C.marbleInk, fontSize: 22, cursor: 'pointer' }} aria-label="Close bag">✕</button>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '12px 32px' }}>
          {items.length === 0 ? (
            <div style={{ padding: '60px 0', textAlign: 'center', fontFamily: "'Prata',serif", fontStyle: 'italic', fontSize: 22, color: C.marbleInkFaint }}>
              Nothing here, <span style={{ color: C.forestEmerald }}>yet.</span>
            </div>
          ) : items.map((it) => (
            <div key={it.cartItemId} style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 18, padding: '20px 0', borderBottom: `1px solid ${C.marbleLine}`, alignItems: 'start' }}>
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
                    <button
                      onClick={() => updateQty(it.cartItemId, it.quantity - 1)}
                      disabled={it.quantity <= 1}
                      aria-label={`Decrease quantity of ${it.name}`}
                      style={{ width: 28, height: 28, background: 'transparent', border: 'none', cursor: it.quantity <= 1 ? 'not-allowed' : 'pointer', fontFamily: "'Raleway',sans-serif", fontSize: 14, color: it.quantity <= 1 ? 'rgba(21,20,15,0.2)' : C.marbleInk }}
                    >−</button>
                    <span style={{ width: 28, textAlign: 'center', fontFamily: "'Raleway',sans-serif", fontSize: 13, color: C.marbleInk }}>{it.quantity}</span>
                    <button onClick={() => updateQty(it.cartItemId, it.quantity + 1)} aria-label={`Increase quantity of ${it.name}`} style={{ width: 28, height: 28, background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: "'Raleway',sans-serif", fontSize: 14, color: C.marbleInk }}>+</button>
                  </div>
                  <span style={{ fontFamily: "'Prata',serif", fontSize: 16, color: C.marbleInk }}>{fmt.format(it.price * it.quantity)}</span>
                </div>
                <button onClick={() => remove(it.cartItemId)} aria-label={`Remove ${it.name}`} style={{ background: 'transparent', border: 'none', color: C.marbleInkFaint, fontFamily: "'Raleway',sans-serif", fontSize: 9, letterSpacing: 1.5, marginTop: 8, padding: 0, cursor: 'pointer', textTransform: 'uppercase', textDecoration: 'underline' }}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div style={{ padding: '24px 32px', borderTop: `1px solid ${C.marbleLine}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
              <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: C.marbleInkFaint }}>Subtotal</span>
              <span style={{ fontFamily: "'Prata',serif", fontSize: 22, color: C.marbleInk }}>{fmt.format(subtotal)}</span>
            </div>
            {/* State the real rule instead of deferring it (M4) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
              <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: C.marbleInkFaint }}>Shipping</span>
              <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13, color: C.marbleInk }}>
                {shippingCost === 0 ? 'Free' : fmt.format(shippingCost)}
              </span>
            </div>
            {shippingCost > 0 && (
              <p style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, color: C.marbleInkFaint, marginBottom: 16, lineHeight: 1.5 }}>
                Add {fmt.format(shippingSettings.free_shipping_threshold - subtotal)} more for free shipping.
              </p>
            )}
            <button onClick={goCheckout} style={{ width: '100%', padding: '16px 0', background: C.forestDark, color: C.cream, border: 'none', fontFamily: "'Raleway',sans-serif", fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', cursor: 'pointer', fontWeight: 600 }}>
              Proceed to Checkout →
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
