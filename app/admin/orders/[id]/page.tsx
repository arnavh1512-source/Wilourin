'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { FIT_KEYS, FIT_LABELS, type FitKey } from '@/lib/fitBounds'

interface OrderItem {
  id: string
  product_name: string
  size: string
  quantity: number
  price: number
  custom_fit?: Partial<Record<FitKey, number>> | null
}

/** Non-zero custom-fit adjustments, in a fixed order, ready for display (H4). */
function fitEntries(fit: OrderItem['custom_fit']): Array<{ label: string; value: string }> {
  if (!fit) return []
  return FIT_KEYS
    .filter(k => typeof fit[k] === 'number' && fit[k] !== 0)
    .map(k => ({ label: FIT_LABELS[k], value: `${fit[k]! > 0 ? '+' : ''}${fit[k]} cm` }))
}

interface Order {
  id: string
  status: string
  total: number
  created_at: string
  shipping_name: string
  shipping_phone: string
  shipping_address: string
  shipping_city: string
  shipping_state: string
  shipping_pincode: string
  razorpay_order_id?: string
  razorpay_payment_id?: string
  tracking_number?: string
  order_items: OrderItem[]
}

const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

const STATUS_COLOR: Record<string, string> = {
  pending: '#92400e', confirmed: '#1d4ed8', processing: '#6d28d9',
  shipped: '#0369a1', delivered: '#15803d', cancelled: '#dc2626',
}

const STATUS_BG: Record<string, string> = {
  pending: '#fef3c7', confirmed: '#dbeafe', processing: '#ede9fe',
  shipped: '#e0f2fe', delivered: '#dcfce7', cancelled: '#fee2e2',
}

const F = { fontFamily: "'Raleway',sans-serif" }
const fmt = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [trackingInput, setTrackingInput] = useState('')
  const [toast, setToast] = useState('')

  useEffect(() => {
    fetch(`/api/admin/orders/${id}`)
      .then(r => r.json())
      .then(d => {
        setOrder(d.data ?? null)
        setTrackingInput(d.data?.tracking_number ?? '')
      })
      .catch(() => setOrder(null))
      .finally(() => setLoading(false))
  }, [id])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const updateStatus = async (status: string) => {
    if (!order || saving) return
    setSaving(true)
    const res = await fetch('/api/admin/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: order.id, status }),
    })
    if (res.ok) {
      setOrder(o => o ? { ...o, status } : o)
      showToast(`Status → ${status}`)
    } else {
      showToast('Failed to update status')
    }
    setSaving(false)
  }

  const saveTracking = async () => {
    if (!order || saving) return
    setSaving(true)
    const res = await fetch('/api/admin/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: order.id, tracking_number: trackingInput }),
    })
    if (res.ok) {
      setOrder(o => o ? { ...o, tracking_number: trackingInput } : o)
      showToast('Tracking number saved')
    } else {
      showToast('Failed to save tracking number')
    }
    setSaving(false)
  }

  if (loading) return <div style={{ ...F, fontSize: 13, color: 'rgba(21,20,15,0.4)', padding: 60 }}>Loading…</div>
  if (!order) return <div style={{ ...F, fontSize: 13, color: '#dc2626', padding: 60 }}>Order not found.</div>

  const date = new Date(order.created_at).toLocaleString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 24, right: 24, background: '#0d2818', color: '#e8e4d8', padding: '12px 20px', ...F, fontSize: 12, letterSpacing: 1, zIndex: 100 }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
        <button onClick={() => router.back()} style={{ background: 'transparent', border: 'none', cursor: 'pointer', ...F, fontSize: 12, color: 'rgba(21,20,15,0.5)', padding: 0, textDecoration: 'underline' }}>
          ← Orders
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: "'Prata',serif", fontSize: 28, color: '#15140f', fontWeight: 400, margin: 0 }}>
            Order #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <div style={{ ...F, fontSize: 12, color: 'rgba(21,20,15,0.5)', marginTop: 4 }}>{date}</div>
        </div>
        <span style={{ background: STATUS_BG[order.status] ?? '#f3f4f6', color: STATUS_COLOR[order.status] ?? '#374151', padding: '6px 14px', ...F, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700 }}>
          {order.status}
        </span>
        <button
          onClick={() => window.print()}
          style={{ padding: '9px 18px', border: '1px solid rgba(21,20,15,0.25)', background: 'transparent', ...F, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer', color: '#15140f' }}
        >
          Print packing slip
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Items */}
          <section style={{ background: '#fff', border: '1px solid rgba(21,20,15,0.12)', padding: 24 }}>
            <div style={{ ...F, fontSize: 10, letterSpacing: 2.5, textTransform: 'uppercase', color: 'rgba(21,20,15,0.45)', marginBottom: 16 }}>Order Items</div>
            {order.order_items.map((item, i) => {
              const fit = fitEntries(item.custom_fit)
              return (
              <div key={item.id ?? i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 12, marginBottom: 12, borderBottom: i < order.order_items.length - 1 ? '1px solid rgba(21,20,15,0.06)' : 'none' }}>
                <div>
                  <div style={{ ...F, fontSize: 13, color: '#15140f', fontWeight: 600 }}>{item.product_name}</div>
                  <div style={{ ...F, fontSize: 11, color: 'rgba(21,20,15,0.55)', marginTop: 3 }}>
                    {item.size ? `Size: ${item.size}` : 'One size'}
                    {item.quantity > 1 && ` × ${item.quantity}`}
                  </div>
                  {/* Custom tailoring must reach the workroom (H4) */}
                  {fit.length > 0 && (
                    <div style={{ marginTop: 6, padding: '8px 10px', background: '#fdf6e3', border: '1px solid rgba(180,83,9,0.25)' }}>
                      <div style={{ ...F, fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase', color: '#92400e', fontWeight: 700, marginBottom: 4 }}>
                        Custom fit &mdash; tailor to these adjustments
                      </div>
                      {fit.map(f => (
                        <div key={f.label} style={{ ...F, fontSize: 11, color: '#15140f' }}>
                          {f.label}: <strong>{f.value}</strong>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ fontFamily: "'Prata',serif", fontSize: 15, color: '#15140f', whiteSpace: 'nowrap' }}>
                  {fmt.format(item.price * item.quantity)}
                </div>
              </div>
              )
            })}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid rgba(21,20,15,0.1)', marginTop: 4 }}>
              <div style={{ ...F, fontSize: 13, color: '#15140f', fontWeight: 600 }}>Total</div>
              <div style={{ fontFamily: "'Prata',serif", fontSize: 20, color: '#15140f' }}>{fmt.format(order.total)}</div>
            </div>
          </section>

          {/* Status */}
          <section style={{ background: '#fff', border: '1px solid rgba(21,20,15,0.12)', padding: 24 }}>
            <div style={{ ...F, fontSize: 10, letterSpacing: 2.5, textTransform: 'uppercase', color: 'rgba(21,20,15,0.45)', marginBottom: 16 }}>Update Status</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {STATUSES.map(s => (
                <button key={s} onClick={() => updateStatus(s)} disabled={saving || order.status === s}
                  style={{
                    padding: '8px 14px', border: '1px solid rgba(21,20,15,0.2)',
                    background: order.status === s ? '#0d2818' : 'transparent',
                    color: order.status === s ? '#e8e4d8' : 'rgba(21,20,15,0.6)',
                    ...F, fontSize: 10, letterSpacing: 1.5, textTransform: 'capitalize',
                    cursor: order.status === s ? 'default' : 'pointer', opacity: saving ? 0.6 : 1,
                  }}>
                  {s}
                </button>
              ))}
            </div>
          </section>

          {/* Tracking */}
          <section style={{ background: '#fff', border: '1px solid rgba(21,20,15,0.12)', padding: 24 }}>
            <div style={{ ...F, fontSize: 10, letterSpacing: 2.5, textTransform: 'uppercase', color: 'rgba(21,20,15,0.45)', marginBottom: 16 }}>Tracking Number</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={trackingInput}
                onChange={e => setTrackingInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveTracking() }}
                placeholder="e.g. DTDC1234567890"
                style={{ flex: 1, padding: '9px 12px', border: '1px solid rgba(21,20,15,0.2)', background: '#faf9f7', ...F, fontSize: 13, color: '#15140f', outline: 'none' }}
              />
              <button onClick={saveTracking} disabled={saving}
                style={{ padding: '9px 20px', background: '#0d2818', color: '#e8e4d8', border: 'none', ...F, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer', opacity: saving ? 0.5 : 1 }}>
                Save
              </button>
            </div>
            {order.tracking_number && (
              <div style={{ ...F, fontSize: 12, color: 'rgba(21,20,15,0.55)', marginTop: 8 }}>Saved: {order.tracking_number}</div>
            )}
          </section>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Shipping address — formatted for label */}
          <section style={{ background: '#fff', border: '1px solid rgba(21,20,15,0.12)', padding: 24 }}>
            <div style={{ ...F, fontSize: 10, letterSpacing: 2.5, textTransform: 'uppercase', color: 'rgba(21,20,15,0.45)', marginBottom: 16 }}>Ship To</div>
            <div style={{ ...F, lineHeight: 1.8, color: '#15140f' }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{order.shipping_name}</div>
              <div style={{ fontSize: 13 }}>{order.shipping_address}</div>
              <div style={{ fontSize: 13 }}>{order.shipping_city}, {order.shipping_state}</div>
              <div style={{ fontSize: 13 }}>{order.shipping_pincode}</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>{order.shipping_phone}</div>
            </div>
          </section>

          {/* Payment info */}
          <section style={{ background: '#fff', border: '1px solid rgba(21,20,15,0.12)', padding: 24 }}>
            <div style={{ ...F, fontSize: 10, letterSpacing: 2.5, textTransform: 'uppercase', color: 'rgba(21,20,15,0.45)', marginBottom: 16 }}>Payment</div>
            <div style={{ display: 'grid', gap: 10 }}>
              {order.razorpay_order_id && (
                <div>
                  <div style={{ ...F, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(21,20,15,0.4)', marginBottom: 2 }}>Razorpay Order</div>
                  <div style={{ ...F, fontSize: 12, color: '#15140f', wordBreak: 'break-all' }}>{order.razorpay_order_id}</div>
                </div>
              )}
              {order.razorpay_payment_id ? (
                <div>
                  <div style={{ ...F, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(21,20,15,0.4)', marginBottom: 2 }}>Payment ID</div>
                  <div style={{ ...F, fontSize: 12, color: '#15140f', wordBreak: 'break-all' }}>{order.razorpay_payment_id}</div>
                </div>
              ) : (
                <div style={{ ...F, fontSize: 12, color: '#92400e' }}>Payment not yet captured</div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          aside, button, nav { display: none !important; }
          body { background: white; }
        }
      `}</style>
    </div>
  )
}
