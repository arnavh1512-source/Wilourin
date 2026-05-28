'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

interface OrderItem { product_name: string; size: string; quantity: number; price: number }
interface Order {
  id: string
  status: string
  total: number
  created_at: string
  shipping_name?: string
  shipping_email?: string
  shipping_phone?: string
  shipping_address?: string
  shipping_city?: string
  shipping_state?: string
  shipping_pincode?: string
  order_items?: OrderItem[]
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

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  const load = async (status = '') => {
    setLoading(true)
    const qs = status ? `?status=${status}` : ''
    const res = await fetch(`/api/admin/orders${qs}`)
    const json = await res.json()
    setOrders(json.data ?? [])
    setLoading(false)
  }

  useEffect(() => { load(filter) }, [filter])

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id)
    await fetch('/api/admin/orders', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) })
    setUpdating(null)
    setOrders(os => os.map(o => o.id === id ? { ...o, status } : o))
  }

  const F = { fontFamily: "'Raleway',sans-serif" }
  const fmt = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: "'Prata',serif", fontSize: 32, color: '#15140f', fontWeight: 400, margin: 0 }}>Orders</h1>
          <p style={{ ...F, fontSize: 13, color: 'rgba(21,20,15,0.55)', marginTop: 4 }}>{orders.length} orders</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setFilter('')} style={{ padding: '8px 16px', border: '1px solid rgba(21,20,15,0.2)', background: !filter ? '#0d2818' : 'transparent', color: !filter ? '#e8e4d8' : 'rgba(21,20,15,0.6)', ...F, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer' }}>All</button>
          {STATUSES.map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{ padding: '8px 14px', border: '1px solid rgba(21,20,15,0.2)', background: filter === s ? '#0d2818' : 'transparent', color: filter === s ? '#e8e4d8' : 'rgba(21,20,15,0.6)', ...F, fontSize: 10, letterSpacing: 1.5, textTransform: 'capitalize', cursor: 'pointer' }}>{s}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ ...F, fontSize: 13, color: 'rgba(21,20,15,0.4)', textAlign: 'center', padding: 60 }}>Loading…</div>
      ) : orders.length === 0 ? (
        <div style={{ ...F, fontSize: 13, color: 'rgba(21,20,15,0.4)', textAlign: 'center', padding: 60 }}>No orders found.</div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid rgba(21,20,15,0.12)' }}>
          {orders.map(o => (
            <div key={o.id}>
              <div
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto auto', padding: '16px 20px', borderBottom: '1px solid rgba(21,20,15,0.06)', alignItems: 'center' }}
              >
                <div style={{ cursor: 'pointer' }} onClick={() => setExpanded(expanded === o.id ? null : o.id)}>
                  <div style={{ ...F, fontSize: 12, color: '#15140f', fontWeight: 600 }}>{o.shipping_name || 'Guest'}</div>
                  <div style={{ ...F, fontSize: 11, color: 'rgba(21,20,15,0.5)', marginTop: 2 }}>#{(o.id).slice(0, 8).toUpperCase()}</div>
                </div>
                <div style={{ ...F, fontSize: 12, color: 'rgba(21,20,15,0.55)', cursor: 'pointer' }} onClick={() => setExpanded(expanded === o.id ? null : o.id)}>
                  {new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
                <div style={{ cursor: 'pointer' }} onClick={() => setExpanded(expanded === o.id ? null : o.id)}>
                  <span style={{ background: STATUS_BG[o.status] ?? '#f3f4f6', color: STATUS_COLOR[o.status] ?? '#374151', padding: '4px 10px', ...F, fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700 }}>
                    {o.status}
                  </span>
                </div>
                <div style={{ fontFamily: "'Prata',serif", fontSize: 16, color: '#15140f', cursor: 'pointer' }} onClick={() => setExpanded(expanded === o.id ? null : o.id)}>{fmt.format(o.total)}</div>
                <Link href={`/admin/orders/${o.id}`} style={{ ...F, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(21,20,15,0.5)', textDecoration: 'none', padding: '4px 8px', border: '1px solid rgba(21,20,15,0.15)', whiteSpace: 'nowrap' }}>
                  Detail →
                </Link>
                <div style={{ ...F, fontSize: 12, color: 'rgba(21,20,15,0.4)', cursor: 'pointer', padding: '4px 8px' }} onClick={() => setExpanded(expanded === o.id ? null : o.id)}>{expanded === o.id ? '▲' : '▼'}</div>
              </div>

              {expanded === o.id && (
                <div style={{ padding: '20px', background: '#faf9f7', borderBottom: '1px solid rgba(21,20,15,0.06)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 20 }}>
                    <div>
                      <div style={{ ...F, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(21,20,15,0.45)', marginBottom: 8 }}>Customer</div>
                      <div style={{ ...F, fontSize: 13, color: '#15140f' }}>{o.shipping_name}</div>
                      <div style={{ ...F, fontSize: 12, color: 'rgba(21,20,15,0.55)' }}>{o.shipping_email}</div>
                      <div style={{ ...F, fontSize: 12, color: 'rgba(21,20,15,0.55)' }}>{o.shipping_phone}</div>
                    </div>
                    <div>
                      <div style={{ ...F, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(21,20,15,0.45)', marginBottom: 8 }}>Shipping Address</div>
                      <div style={{ ...F, fontSize: 13, color: '#15140f' }}>{o.shipping_address}</div>
                      <div style={{ ...F, fontSize: 12, color: 'rgba(21,20,15,0.55)' }}>{o.shipping_city}{o.shipping_state ? `, ${o.shipping_state}` : ''} {o.shipping_pincode ?? ''}</div>
                    </div>
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <div style={{ ...F, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(21,20,15,0.45)', marginBottom: 8 }}>Items</div>
                    {o.order_items?.map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', ...F, fontSize: 13, color: '#15140f', marginBottom: 4 }}>
                        <span>{item.product_name} {item.size && `— ${item.size}`} × {item.quantity}</span>
                        <span>{fmt.format(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <div>
                    <div style={{ ...F, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(21,20,15,0.45)', marginBottom: 8 }}>Update Status</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {STATUSES.map(s => (
                        <button key={s} onClick={() => updateStatus(o.id, s)} disabled={updating === o.id || o.status === s}
                          style={{ padding: '7px 14px', border: '1px solid rgba(21,20,15,0.2)', background: o.status === s ? '#0d2818' : 'transparent', color: o.status === s ? '#e8e4d8' : 'rgba(21,20,15,0.6)', ...F, fontSize: 10, letterSpacing: 1.5, textTransform: 'capitalize', cursor: o.status === s ? 'default' : 'pointer', opacity: updating === o.id ? 0.5 : 1 }}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
