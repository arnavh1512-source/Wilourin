'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { Logo } from '@/components/Logo'
import NextImage from 'next/image'
import { useWishlistStore, type WishlistItem } from '@/lib/wishlistStore'

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
  const searchParams = useSearchParams()
  const initialTab = (searchParams.get('tab') as 'orders' | 'saved' | 'profile') ?? 'orders'
  const [tab, setTab] = useState<'orders' | 'saved' | 'profile'>(initialTab)
  const [name, setName]  = useState(profile?.full_name ?? '')
  const [phone, setPhone] = useState(profile?.phone ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const wishlistStore = useWishlistStore()
  const router = useRouter()

  useEffect(() => {
    setWishlist(wishlistStore.items)
  }, [wishlistStore.items])

  const signOut = async () => {
    await createClient().auth.signOut()
    router.push('/')
    router.refresh()
  }

  const saveProfile = async () => {
    setSaving(true)
    const { error } = await createClient().from('profiles').update({ full_name: name, phone }).eq('id', user.id)
    setSaving(false)
    if (error) { alert('Failed to save profile. Please try again.'); return }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const tabBtn = (t: 'orders' | 'saved' | 'profile', label: string) => (
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
      <div style={{ borderBottom: `1px solid ${C.marbleLine}`, padding: '20px 40px', display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center' }}>
        <div />
        <a href="/" style={{ display: 'flex', justifyContent: 'center' }}><Logo height={40} /></a>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={signOut} style={{ background: 'transparent', border: `1px solid ${C.marbleLine}`, padding: '8px 20px', fontFamily: "'Raleway',sans-serif", fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', cursor: 'pointer', color: C.inkFaint }}>
            Sign out
          </button>
        </div>
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
          {tabBtn('saved', `Saved${wishlist.length > 0 ? ` (${wishlist.length})` : ''}`)}
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

        {/* Saved Tab */}
        {tab === 'saved' && (
          <div>
            {wishlist.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <p style={{ fontFamily: "'Prata',serif", fontSize: 22, color: C.inkFaint, fontStyle: 'italic' }}>Nothing saved yet.</p>
                <a href="/" style={{ display: 'inline-block', marginTop: 20, fontFamily: "'Raleway',sans-serif", fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: C.marbleInk, textDecoration: 'underline' }}>Explore the collection</a>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 24 }}>
                {wishlist.map((item) => (
                  <div key={item.id} style={{ position: 'relative' }}>
                    <a href={item.slug ? `/products/${item.slug}` : '/'} style={{ textDecoration: 'none', display: 'block' }}>
                      <div style={{ aspectRatio: '2/3', background: '#fafaf7', border: `1px solid ${C.marbleLine}`, overflow: 'hidden', position: 'relative' }}>
                        <NextImage src={item.img} alt={item.name} fill style={{ objectFit: 'cover', objectPosition: 'top' }} sizes="200px" />
                      </div>
                      <div style={{ paddingTop: 12 }}>
                        <div style={{ fontFamily: "'Prata',serif", fontSize: 16, color: C.marbleInk, lineHeight: 1.2 }}>{item.name}</div>
                        <div style={{ fontFamily: "'Prata',serif", fontSize: 14, color: C.marbleInk, marginTop: 4 }}>₹{Number(item.price).toLocaleString('en-IN')}</div>
                      </div>
                    </a>
                    <button
                      onClick={() => wishlistStore.toggle(item)}
                      style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(244,241,236,0.9)', border: 'none', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      aria-label="Remove from saved"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="#0d2818" stroke="#0d2818" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20.5s-7.5-4.5-9.4-9.2C1.2 7.6 4 4 7.5 4c2 0 3.5 1.2 4.5 2.8C13 5.2 14.5 4 16.5 4 20 4 22.8 7.6 21.4 11.3 19.5 16 12 20.5 12 20.5z"/>
                      </svg>
                    </button>
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
