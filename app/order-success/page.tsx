'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/Logo'

const C = { marbleBase: '#f4f1ec', marbleInk: '#15140f', marbleLine: 'rgba(21,20,15,0.22)', forestDark: '#0d2818', cream: '#e8e4d8', inkFaint: 'rgba(21,20,15,0.55)' }
const F = { fontFamily: "'Raleway',sans-serif" }

interface Order { id: string; status: string; total: number; created_at: string }

function SuccessContent() {
  const params = useSearchParams()
  const id = params.get('id')
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const finish = (data: Order | null) => { if (active) { setOrder(data); setLoading(false) } }
    const supabase = createClient()
    supabase.auth.getUser()
      .then(({ data: { user } }) => {
        if (!id || !user) return null
        return supabase
          .from('orders')
          .select('id, status, total, created_at')
          .eq('id', id)
          .eq('user_id', user.id)
          .single()
          .then(({ data }) => data as Order | null)
      })
      .then(finish)
      .catch(() => finish(null))
    return () => { active = false }
  }, [id])

  const header = (
    <div style={{ borderBottom: `1px solid ${C.marbleLine}`, padding: '20px 40px' }}>
      <Link href="/"><Logo height={36} /></Link>
    </div>
  )

  if (loading) return <div style={{ minHeight: '100vh', background: C.marbleBase }}>{header}</div>

  if (!order) return (
    <div style={{ minHeight: '100vh', background: C.marbleBase }}>
      {header}
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: "'Prata',serif", fontSize: 36, color: C.marbleInk, fontWeight: 400, margin: '0 0 16px' }}>Order Not Found</h1>
        <p style={{ ...F, fontSize: 14, color: C.inkFaint, lineHeight: 1.7, marginBottom: 40 }}>We could not locate that order. Please check your email for confirmation details.</p>
        <Link href="/account" style={{ padding: '13px 28px', background: C.forestDark, color: C.cream, textDecoration: 'none', ...F, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', fontWeight: 600 }}>View Orders</Link>
      </div>
    </div>
  )

  const isSuccess = ['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status)

  return (
    <div style={{ minHeight: '100vh', background: C.marbleBase }}>
      {header}
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 24 }}>{isSuccess ? '✓' : '!'}</div>
        <h1 style={{ fontFamily: "'Prata',serif", fontSize: 36, color: C.marbleInk, fontWeight: 400, margin: '0 0 16px' }}>
          {isSuccess ? 'Order Confirmed' : 'Payment Pending'}
        </h1>
        <p style={{ ...F, fontSize: 14, color: C.inkFaint, lineHeight: 1.7, marginBottom: 8 }}>
          {isSuccess ? "Thank you for your order. We're preparing your piece with care." : "We're still processing your payment. You'll receive an email once confirmed."}
        </p>
        <p style={{ ...F, fontSize: 11, color: C.inkFaint, letterSpacing: 1, marginBottom: 40 }}>
          Order #{order.id.slice(0, 8).toUpperCase()} · {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/account" style={{ padding: '13px 28px', background: C.forestDark, color: C.cream, textDecoration: 'none', ...F, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', fontWeight: 600 }}>View Orders</Link>
          <Link href="/" style={{ padding: '13px 28px', background: 'transparent', border: `1px solid ${C.marbleLine}`, color: C.marbleInk, textDecoration: 'none', ...F, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase' }}>Continue Shopping</Link>
        </div>
      </div>
    </div>
  )
}

export default function OrderSuccessPage() {
  return <Suspense fallback={null}><SuccessContent /></Suspense>
}
