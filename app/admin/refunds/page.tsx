'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Refund {
  id: string
  order_id: string | null
  razorpay_payment_id: string
  razorpay_refund_id: string | null
  amount: number
  reason: string
  status: 'pending' | 'processing' | 'refunded' | 'failed' | 'resolved'
  attempts: number
  last_error: string | null
  created_at: string
}

const F = { fontFamily: "'Raleway',sans-serif" }
const fmt = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })

const STATUS_COLOR: Record<Refund['status'], string> = {
  pending:    '#b45309',
  processing: '#b45309',
  failed:     '#dc2626',
  refunded:   '#1f4a30',
  resolved:   'rgba(21,20,15,0.5)',
}

export default function AdminRefunds() {
  const [refunds, setRefunds] = useState<Refund[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [working, setWorking] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    fetch('/api/admin/refunds')
      .then(async res => {
        if (!res.ok) throw new Error('Failed to load refunds.')
        return res.json()
      })
      .then(json => { if (active) { setRefunds(json.data ?? []); setLoading(false) } })
      .catch(() => { if (active) { setError('Failed to load refunds.'); setLoading(false) } })
    return () => { active = false }
  }, [])

  const act = async (id: string, action: 'retry' | 'resolved') => {
    const question = action === 'retry'
      ? 'Send this refund to Razorpay now?'
      : 'Mark this refund as settled outside Razorpay?'
    if (!confirm(question)) return

    setWorking(id)
    setError('')
    const res = await fetch('/api/admin/refunds', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action }),
    })
    const json = await res.json().catch(() => null)
    setWorking(null)

    if (json?.data) setRefunds(rs => rs.map(r => r.id === id ? json.data : r))
    if (!res.ok) setError(json?.error ?? 'Razorpay rejected the refund. See the row for details.')
  }

  const open = refunds.filter(r => r.status !== 'refunded' && r.status !== 'resolved')
  const owed = open.reduce((sum, r) => sum + Number(r.amount), 0)

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Prata',serif", fontSize: 32, color: '#15140f', fontWeight: 400, margin: 0 }}>Refunds</h1>
        <p style={{ ...F, fontSize: 13, color: 'rgba(21,20,15,0.55)', marginTop: 4 }}>
          Payments captured for orders that could not be fulfilled. {open.length} open
          {open.length > 0 ? ` · ${fmt.format(owed)} owed` : ''}.
        </p>
      </div>

      {error && (
        <div style={{ ...F, fontSize: 12, color: '#dc2626', border: '1px solid #dc2626', padding: '10px 14px', marginBottom: 20 }}>{error}</div>
      )}

      {loading ? (
        <div style={{ ...F, fontSize: 13, color: 'rgba(21,20,15,0.4)', textAlign: 'center', padding: 60 }}>Loading…</div>
      ) : refunds.length === 0 ? (
        <div style={{ ...F, fontSize: 13, color: 'rgba(21,20,15,0.4)', textAlign: 'center', padding: 60 }}>
          No refunds owed. Every captured payment has been fulfilled.
        </div>
      ) : (
        <div style={{ border: '1px solid rgba(21,20,15,0.12)' }}>
          {refunds.map((r, i) => (
            <div key={r.id} className="refund-row" style={{ display: 'grid', gridTemplateColumns: '1fr 130px 110px 190px', gap: 16, alignItems: 'center', padding: '16px 18px', borderTop: i === 0 ? 'none' : '1px solid rgba(21,20,15,0.08)' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ ...F, fontSize: 13, color: '#15140f', fontWeight: 600 }}>{r.reason}</div>
                <div style={{ ...F, fontSize: 11, color: 'rgba(21,20,15,0.5)', marginTop: 3, wordBreak: 'break-all' }}>
                  Payment {r.razorpay_payment_id}
                  {r.razorpay_refund_id ? ` · Refund ${r.razorpay_refund_id}` : ''}
                </div>
                <div style={{ ...F, fontSize: 11, color: 'rgba(21,20,15,0.5)', marginTop: 3 }}>
                  {new Date(r.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  {r.attempts > 0 ? ` · ${r.attempts} attempt${r.attempts === 1 ? '' : 's'}` : ''}
                  {r.order_id && (
                    <> · <Link href={`/admin/orders/${r.order_id}`} style={{ color: '#1f4a30' }}>View order</Link></>
                  )}
                </div>
                {r.last_error && (
                  <div style={{ ...F, fontSize: 11, color: '#dc2626', marginTop: 4 }}>{r.last_error}</div>
                )}
              </div>

              <div style={{ ...F, fontSize: 15, color: '#15140f' }}>{fmt.format(Number(r.amount))}</div>

              <div style={{ ...F, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: STATUS_COLOR[r.status] }}>
                {r.status}
              </div>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                {r.status !== 'refunded' && r.status !== 'resolved' && (
                  <>
                    <button onClick={() => act(r.id, 'retry')} disabled={working === r.id}
                      style={{ ...F, padding: '7px 12px', border: '1px solid #1f4a30', background: 'transparent', color: '#1f4a30', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', cursor: working === r.id ? 'wait' : 'pointer' }}>
                      {working === r.id ? '…' : 'Refund now'}
                    </button>
                    <button onClick={() => act(r.id, 'resolved')} disabled={working === r.id}
                      style={{ ...F, padding: '7px 12px', border: '1px solid rgba(21,20,15,0.2)', background: 'transparent', color: 'rgba(21,20,15,0.6)', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', cursor: working === r.id ? 'wait' : 'pointer' }}>
                      Settled
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
