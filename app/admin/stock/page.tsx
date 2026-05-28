'use client'

import { useEffect, useState } from 'react'

interface Variant {
  id: string
  size: string
  stock_qty: number
}

interface Product {
  id: string
  name: string
  product_variants: Variant[]
}

const F = { fontFamily: "'Raleway',sans-serif" }

export default function AdminStock() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [toast, setToast] = useState('')

  useEffect(() => {
    fetch('/api/admin/stock')
      .then(r => r.json())
      .then(d => { setProducts(d.data ?? []); setLoading(false) })
  }, [])

  const showToast = (msg: string) => {
    setToast(msg); setTimeout(() => setToast(''), 2000)
  }

  const startEdit = (variantId: string, current: number) =>
    setEditing(e => ({ ...e, [variantId]: String(current) }))

  const cancelEdit = (variantId: string) =>
    setEditing(e => { const n = { ...e }; delete n[variantId]; return n })

  const save = async (variantId: string, productId: string) => {
    const val = parseInt(editing[variantId])
    if (isNaN(val) || val < 0) return
    setSaving(variantId)
    const res = await fetch('/api/admin/stock', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variantId, stock_qty: val }),
    })
    if (res.ok) {
      setProducts(ps => ps.map(p =>
        p.id !== productId ? p : {
          ...p,
          product_variants: p.product_variants.map(v =>
            v.id === variantId ? { ...v, stock_qty: val } : v
          ),
        }
      ))
      cancelEdit(variantId)
      showToast('Stock updated')
    }
    setSaving(null)
  }

  const totalVariants = products.reduce((s, p) => s + p.product_variants.length, 0)
  const lowStockCount = products.reduce((s, p) => s + p.product_variants.filter(v => v.stock_qty < 5).length, 0)

  return (
    <div>
      {toast && (
        <div style={{ position: 'fixed', top: 24, right: 24, background: '#0d2818', color: '#e8e4d8', padding: '12px 20px', ...F, fontSize: 12, letterSpacing: 1, zIndex: 100 }}>
          {toast}
        </div>
      )}

      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Prata',serif", fontSize: 32, color: '#15140f', fontWeight: 400, margin: 0 }}>Stock</h1>
        <p style={{ ...F, fontSize: 13, color: 'rgba(21,20,15,0.55)', marginTop: 4 }}>
          {totalVariants} variants ·{' '}
          {lowStockCount > 0
            ? <span style={{ color: '#dc2626' }}>{lowStockCount} low stock</span>
            : <span>all stocked</span>}
        </p>
      </div>

      {loading ? (
        <div style={{ ...F, fontSize: 13, color: 'rgba(21,20,15,0.4)', textAlign: 'center', padding: 60 }}>Loading…</div>
      ) : products.length === 0 ? (
        <div style={{ ...F, fontSize: 13, color: 'rgba(21,20,15,0.4)', textAlign: 'center', padding: 60 }}>No products found.</div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid rgba(21,20,15,0.12)' }}>
          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 130px', padding: '12px 20px', borderBottom: '1px solid rgba(21,20,15,0.1)', background: '#faf9f7' }}>
            {['Product', 'Size', 'Stock', ''].map(h => (
              <div key={h} style={{ ...F, fontSize: 9, letterSpacing: 2.5, textTransform: 'uppercase', color: 'rgba(21,20,15,0.45)' }}>{h}</div>
            ))}
          </div>

          {products.flatMap(product =>
            product.product_variants.map((variant, i) => {
              const isLow = variant.stock_qty < 5
              const isEditing = variant.id in editing
              return (
                <div
                  key={variant.id}
                  style={{
                    display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 130px',
                    padding: '13px 20px', borderBottom: '1px solid rgba(21,20,15,0.06)',
                    alignItems: 'center',
                    background: isLow ? 'rgba(220,38,38,0.04)' : undefined,
                  }}
                >
                  <div style={{ ...F, fontSize: 13, color: '#15140f' }}>
                    {i === 0 ? product.name : ''}
                  </div>
                  <div style={{ ...F, fontSize: 12, color: 'rgba(21,20,15,0.65)' }}>{variant.size}</div>
                  <div>
                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        value={editing[variant.id]}
                        onChange={e => setEditing(ed => ({ ...ed, [variant.id]: e.target.value }))}
                        onKeyDown={e => {
                          if (e.key === 'Enter') save(variant.id, product.id)
                          if (e.key === 'Escape') cancelEdit(variant.id)
                        }}
                        autoFocus
                        style={{ width: 64, padding: '4px 8px', border: '1px solid #0d2818', ...F, fontSize: 13, color: '#15140f', outline: 'none', background: '#fff' }}
                      />
                    ) : (
                      <span style={{ ...F, fontSize: 13, color: isLow ? '#dc2626' : '#15140f', fontWeight: isLow ? 700 : 400 }}>
                        {variant.stock_qty}{isLow && variant.stock_qty === 0 ? ' — out of stock' : isLow ? ' ⚠' : ''}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => save(variant.id, product.id)}
                          disabled={saving === variant.id}
                          style={{ padding: '5px 14px', background: '#0d2818', color: '#e8e4d8', border: 'none', ...F, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer', opacity: saving === variant.id ? 0.5 : 1 }}
                        >
                          Save
                        </button>
                        <button
                          onClick={() => cancelEdit(variant.id)}
                          style={{ padding: '5px 10px', background: 'transparent', border: '1px solid rgba(21,20,15,0.2)', ...F, fontSize: 11, cursor: 'pointer', color: 'rgba(21,20,15,0.5)' }}
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => startEdit(variant.id, variant.stock_qty)}
                        style={{ padding: '5px 14px', background: 'transparent', border: '1px solid rgba(21,20,15,0.2)', ...F, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer', color: 'rgba(21,20,15,0.6)' }}
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
