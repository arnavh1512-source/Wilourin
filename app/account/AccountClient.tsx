'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { Logo } from '@/components/Logo'

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

const STATUS_COLOR: Record<string, string> = {
  pending:    '#92400e',
  confirmed:  '#1d4ed8',
  processing: '#6d28d9',
  shipped:    '#0369a1',
  delivered:  '#15803d',
  cancelled:  '#dc2626',
}

const STATUS_BG: Record<string, string> = {
  pending:    '#fef3c7',
  confirmed:  '#dbeafe',
  processing: '#ede9fe',
  shipped:    '#e0f2fe',
  delivered:  '#dcfce7',
  cancelled:  '#fee2e2',
}

interface Order {
  id: string
  status: string
  total: number
  created_at: string
  order_items: Array<{ product_name: string; size: string; quantity: number; price: number }>
}

interface Profile { full_name: string | null; phone: string | null; role: string }

interface Props {
  user: User
  profile: Profile | null
  orders: Order[]
}

export function AccountClient({ user, profile, orders }: Props) {
  const [tab, setTab] = useState<'orders' | 'profile'>('orders')
  const [name, setName]  = useState(profile?.full_name ?? '')
  const [phone, setPhone] = useState(profile?.phone ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)
  const router = useRouter()

  const signOut = async () => {
    await createClient().auth.signOut()
    router.push('/')
    router.refresh()
  }

  const saveProfile = async () => {
    setSaving(true)
    await createClient().from('profiles').update({ full_name: name, phone }).eq('id', user.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const tabBtn = (t: 'orders' | 'profile', label: string) => (
    <button
      onClick={() => setTab(t)}
      style={{
        background: 'transparent', border: 'none', cursor: 'pointer', padding: '10px 0',
        fontFamily: "'Raleway',sans-serif", fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', fontWeight: 600,
        color: tab === t ? C.marbleInk : C.inkFaint,
        borderBottom: tab === t ? `2px solid ${C.marbleInk}` : '2px solid transparent',
        marginRight: 32, transition: 'color 0.2s',
      }}
    >{label}</button>
  )

  return (
    <div style={{ minHeight: '100vh', background: C.marbleBase }}>
      {/* Header */}
      <div style={{ borderBottom: `1px solid ${C.marbleLine}`, padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="/" style={{ display: 'block' }}><Logo height={40} /></a>
        <button onClick={signOut} style={{ background: 'transparent', border: `1px solid ${C.marbleLine}`, padding: '8px 20px', fontFamily: "'Raleway',sans-serif", fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', cursor: 'pointer', color: C.inkFaint }}>
          Sign out
        </button>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 10, letterSpacing: 3, color: C.inkFaint, textTransform: 'uppercase', marginBottom: 8 }}>My Account</div>
          <h1 style={{ fontFamily: "'Prata',serif", fontSize: 36, color: C.marbleInk, fontWeight: 400, margin: 0 }}>
            {profile?.full_name || user.email?.split('@')[0]}
          </h1>
          <p style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13, color: C.inkFaint, marginTop: 4 }}>{user.email}</p>
        </div>

        {/* Tabs */}
        <div style={{ borderBottom: `1px solid ${C.marbleLine}`, marginTop: 32, marginBottom: 40 }}>
          {tabBtn('orders', 'Orders')}
          {tabBtn('profile', 'Profile')}
        </div>

        {/* Orders Tab */}
        {tab === 'orders' && (
          <div>
            {orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <p style={{ fontFamily: "'Prata',serif", fontSize: 22, color: C.inkFaint, fontStyle: 'italic' }}>No orders yet.</p>
                <a href="/" style={{ display: 'inline-block', marginTop: 20, fontFamily: "'Raleway',sans-serif", fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: C.marbleInk, textDecoration: 'underline' }}>Continue shopping</a>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {orders.map((order) => (
                  <div key={order.id} style={{ border: `1px solid ${C.marbleLine}`, padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                      <div>
                        <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 10, letterSpacing: 2, color: C.inkFaint, textTransform: 'uppercase' }}>
                          Order #{order.id.slice(0, 8).toUpperCase()}
                        </div>
                        <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: C.inkFaint, marginTop: 2 }}>
                          {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ background: STATUS_BG[order.status] ?? '#f3f4f6', color: STATUS_COLOR[order.status] ?? '#374151', padding: '4px 10px', fontFamily: "'Raleway',sans-serif", fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700 }}>
                          {order.status}
                        </span>
                        <span style={{ fontFamily: "'Prata',serif", fontSize: 18, color: C.marbleInk }}>
                          ₹{order.total.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {order.order_items?.map((item, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Raleway',sans-serif", fontSize: 13, color: C.inkSoft }}>
                          <span>{item.product_name} {item.size && `— ${item.size}`} × {item.quantity}</span>
                          <span>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {tab === 'profile' && (
          <div style={{ maxWidth: 440 }}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontFamily: "'Raleway',sans-serif", fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: C.inkFaint, marginBottom: 8 }}>Full Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', border: `1px solid ${C.marbleLine}`, background: 'transparent', fontFamily: "'Raleway',sans-serif", fontSize: 14, color: C.marbleInk, outline: 'none' }}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontFamily: "'Raleway',sans-serif", fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: C.inkFaint, marginBottom: 8 }}>Phone</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', border: `1px solid ${C.marbleLine}`, background: 'transparent', fontFamily: "'Raleway',sans-serif", fontSize: 14, color: C.marbleInk, outline: 'none' }}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontFamily: "'Raleway',sans-serif", fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: C.inkFaint, marginBottom: 8 }}>Email</label>
              <input
                value={user.email ?? ''}
                disabled
                style={{ width: '100%', padding: '12px 16px', border: `1px solid ${C.marbleLine}`, background: '#fafaf7', fontFamily: "'Raleway',sans-serif", fontSize: 14, color: C.inkFaint, outline: 'none', cursor: 'not-allowed' }}
              />
            </div>
            <button
              onClick={saveProfile}
              disabled={saving}
              style={{ padding: '13px 32px', background: C.forestDark, color: C.cream, border: 'none', fontFamily: "'Raleway',sans-serif", fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', cursor: saving ? 'wait' : 'pointer', fontWeight: 600, opacity: saving ? 0.7 : 1 }}
            >
              {saved ? '✓ Saved' : saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
