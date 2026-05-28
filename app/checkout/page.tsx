'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/lib/store'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/Logo'

const C = {
  marbleBase:  '#f4f1ec',
  marbleInk:   '#15140f',
  marbleLine:  'rgba(21,20,15,0.22)',
  forestDark:  '#0d2818',
  cream:       '#e8e4d8',
  inkFaint:    'rgba(21,20,15,0.55)',
}
const F = { fontFamily: "'Raleway',sans-serif" }
const fmt = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })

declare global { interface Window { Razorpay: new (opts: object) => { open(): void } } }

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotal, clear } = useCartStore()
  const total = getTotal()

  const [shipping, setShipping] = useState({ name: '', phone: '', address: '', city: '', state: '', pincode: '' })
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')

  const set = (k: keyof typeof shipping) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setShipping(s => ({ ...s, [k]: e.target.value }))

  const loadRazorpay = () => new Promise<boolean>(resolve => {
    if (window.Razorpay) return resolve(true)
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload = () => resolve(true)
    s.onerror = () => resolve(false)
    document.body.appendChild(s)
  })

  const handlePay = async () => {
    const { name, phone, address, city, state, pincode } = shipping
    if (!name || !phone || !address || !city || !state || !pincode) { setError('Please fill all fields.'); return }
    if (!/^[6-9]\d{9}$/.test(phone)) { setError('Enter a valid 10-digit Indian mobile number.'); return }
    if (!/^\d{6}$/.test(pincode)) { setError('Enter a valid 6-digit pincode.'); return }
    if (items.length === 0) { setError('Your cart is empty.'); return }

    setPaying(true); setError('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login?next=/checkout'); return }

    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, shipping, total }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Payment failed'); setPaying(false); return }

    const loaded = await loadRazorpay()
    if (!loaded) { setError('Failed to load payment gateway'); setPaying(false); return }

    const rzp = new window.Razorpay({
      key:         data.keyId,
      amount:      data.amount,
      currency:    data.currency,
      order_id:    data.rzpOrderId,
      name:        'Wilourin',
      description: `Order of ${items.length} item${items.length > 1 ? 's' : ''}`,
      prefill:     { name: shipping.name, contact: shipping.phone },
      theme:       { color: '#0d2818' },
      handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
        const verify = await fetch('/api/checkout/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: data.orderId, ...response }),
        })
        if (verify.ok) {
          clear()
          router.push(`/order-success?id=${data.orderId}`)
        } else {
          setError('Payment verification failed. Contact support.')
          setPaying(false)
        }
      },
      modal: { ondismiss: () => setPaying(false) },
    })
    rzp.open()
  }

  if (items.length === 0 && !paying) {
    return (
      <div style={{ minHeight: '100vh', background: C.marbleBase, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        <p style={{ fontFamily: "'Prata',serif", fontSize: 22, color: C.inkFaint, fontStyle: 'italic' }}>Your bag is empty.</p>
        <Link href="/" style={{ ...F, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: C.marbleInk, textDecoration: 'underline' }}>Continue Shopping</Link>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: C.marbleBase }}>
      <div style={{ borderBottom: `1px solid ${C.marbleLine}`, padding: '20px 40px' }}>
        <Link href="/"><Logo height={36} /></Link>
      </div>

      <div className="checkout-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 420px', maxWidth: 1100, margin: '0 auto', padding: '48px 24px', gap: 48, alignItems: 'start' }}>

        {/* Shipping form */}
        <div>
          <div style={{ fontFamily: "'Prata',serif", fontSize: 28, color: C.marbleInk, fontWeight: 400, marginBottom: 32 }}>Shipping Details</div>

          <Field label="Full Name *"><input value={shipping.name} onChange={set('name')} style={inputStyle} /></Field>
          <Field label="Phone *"><input value={shipping.phone} onChange={set('phone')} style={inputStyle} /></Field>
          <Field label="Address *"><input value={shipping.address} onChange={set('address')} style={inputStyle} /></Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="City *"><input value={shipping.city} onChange={set('city')} style={inputStyle} /></Field>
            <Field label="State *"><input value={shipping.state} onChange={set('state')} style={inputStyle} /></Field>
          </div>
          <Field label="Pincode *"><input value={shipping.pincode} onChange={set('pincode')} style={{ ...inputStyle, maxWidth: 160 }} /></Field>

          {error && <p style={{ ...F, fontSize: 12, color: '#dc2626', marginTop: 8 }}>{error}</p>}
        </div>

        {/* Order summary */}
        <div style={{ border: `1px solid ${C.marbleLine}`, padding: 28 }}>
          <div style={{ fontFamily: "'Prata',serif", fontSize: 20, color: C.marbleInk, marginBottom: 20 }}>Order Summary</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
            {items.map((it) => (
              <div key={it.cartItemId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div>
                  <div style={{ ...F, fontSize: 13, color: C.marbleInk }}>{it.name}</div>
                  <div style={{ ...F, fontSize: 11, color: C.inkFaint }}>Size {it.size} · Qty {it.quantity}</div>
                </div>
                <div style={{ fontFamily: "'Prata',serif", fontSize: 14, color: C.marbleInk, whiteSpace: 'nowrap' }}>{fmt.format(it.price * it.quantity)}</div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: `1px solid ${C.marbleLine}`, paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 24 }}>
            <span style={{ ...F, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: C.inkFaint }}>Total</span>
            <span style={{ fontFamily: "'Prata',serif", fontSize: 24, color: C.marbleInk }}>{fmt.format(total)}</span>
          </div>

          <button onClick={handlePay} disabled={paying}
            style={{ width: '100%', padding: '16px 0', background: paying ? C.inkFaint : C.forestDark, color: C.cream, border: 'none', ...F, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', fontWeight: 600, cursor: paying ? 'wait' : 'pointer', transition: 'background 0.2s' }}>
            {paying ? 'Processing…' : `Pay ${fmt.format(total)} →`}
          </button>

          <p style={{ ...F, fontSize: 10, color: C.inkFaint, textAlign: 'center', marginTop: 12 }}>Secured by Razorpay</p>
        </div>
      </div>

      <style>{`
        @media (max-width: 800px) {
          .checkout-grid { grid-template-columns: 1fr !important; padding: 32px 16px !important; }
        }
      `}</style>
    </div>
  )
}

const inputStyle: React.CSSProperties = { width: '100%', padding: '12px 16px', border: `1px solid rgba(21,20,15,0.22)`, background: 'transparent', fontFamily: "'Raleway',sans-serif", fontSize: 13, color: '#15140f', outline: 'none', boxSizing: 'border-box' }

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(21,20,15,0.55)', marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  )
}
