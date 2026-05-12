'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Variant { size: string; stock_qty: number }
interface Product {
  id: string; name: string; slug: string; price: number
  original_price?: number; category?: string; is_published: boolean
  created_at: string
  product_images?: Array<{ url: string }>
  product_variants?: Variant[]
}

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const emptyForm = {
  name: '', description: '', price: '', original_price: '',
  category: '', is_published: false,
  images: [] as string[],
  variants: SIZES.map(s => ({ size: s, stock_qty: 0 })),
}

export default function AdminProducts() {
  const [products, setProducts]   = useState<Product[]>([])
  const [loading, setLoading]     = useState(true)
  const [modal, setModal]         = useState(false)
  const [editing, setEditing]     = useState<Product | null>(null)
  const [form, setForm]           = useState(emptyForm)
  const [saving, setSaving]       = useState(false)
  const [deleting, setDeleting]   = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const F = { fontFamily: "'Raleway',sans-serif" }

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/products')
    const json = await res.json()
    setProducts(json.data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModal(true) }

  const openEdit = (p: Product) => {
    setEditing(p)
    setForm({
      name: p.name, description: '',
      price: String(p.price),
      original_price: String(p.original_price ?? ''),
      category: p.category ?? '',
      is_published: p.is_published,
      images: p.product_images?.map(i => i.url) ?? [],
      variants: SIZES.map(s => {
        const v = p.product_variants?.find(x => x.size === s)
        return { size: s, stock_qty: v?.stock_qty ?? 0 }
      }),
    })
    setModal(true)
  }

  const uploadFile = async (file: File) => {
    setUploading(true)
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token ?? ''
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/admin/upload', { method: 'POST', headers: { authorization: `Bearer ${token}` }, body: fd })
    const json = await res.json()
    setUploading(false)
    if (json.url) setForm(f => ({ ...f, images: [...f.images, json.url] }))
  }

  const removeImage = (idx: number) =>
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }))

  const save = async () => {
    if (!form.name || !form.price) return
    setSaving(true)
    const payload = {
      name: form.name, description: form.description,
      price: parseFloat(form.price),
      original_price: form.original_price ? parseFloat(form.original_price) : null,
      category: form.category || null,
      is_published: form.is_published,
      images: form.images,
      variants: form.variants.filter(v => v.stock_qty > 0),
    }
    if (editing) {
      await fetch('/api/admin/products', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editing.id, ...payload }) })
    } else {
      await fetch('/api/admin/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    }
    setSaving(false); setModal(false); load()
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this product?')) return
    setDeleting(id)
    await fetch('/api/admin/products', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setDeleting(null); load()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: "'Prata',serif", fontSize: 32, color: '#15140f', fontWeight: 400, margin: 0 }}>Products</h1>
          <p style={{ ...F, fontSize: 13, color: 'rgba(21,20,15,0.55)', marginTop: 4 }}>{products.length} items</p>
        </div>
        <button onClick={openAdd} style={{ background: '#0d2818', color: '#e8e4d8', border: 'none', padding: '12px 24px', ...F, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', cursor: 'pointer', fontWeight: 600 }}>
          + Add Product
        </button>
      </div>

      {loading ? (
        <div style={{ ...F, fontSize: 13, color: 'rgba(21,20,15,0.4)', textAlign: 'center', padding: 60 }}>Loading…</div>
      ) : products.length === 0 ? (
        <div style={{ ...F, fontSize: 13, color: 'rgba(21,20,15,0.4)', textAlign: 'center', padding: 60 }}>No products yet.</div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid rgba(21,20,15,0.12)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', padding: '10px 20px', borderBottom: '1px solid rgba(21,20,15,0.1)', ...F, fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(21,20,15,0.45)' }}>
            <span>Product</span><span>Category</span><span>Price</span><span>Published</span><span></span>
          </div>
          {products.map(p => (
            <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', padding: '16px 20px', borderBottom: '1px solid rgba(21,20,15,0.06)', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {p.product_images?.[0] && <img src={p.product_images[0].url} alt={p.name} style={{ width: 40, height: 60, objectFit: 'cover', objectPosition: 'top center' }} />}
                <div style={{ ...F, fontSize: 13, color: '#15140f', fontWeight: 600 }}>{p.name}</div>
              </div>
              <div style={{ ...F, fontSize: 12, color: 'rgba(21,20,15,0.55)' }}>{p.category || '—'}</div>
              <div style={{ fontFamily: "'Prata',serif", fontSize: 15, color: '#15140f' }}>₹{Number(p.price).toLocaleString('en-IN')}</div>
              <div style={{ ...F, fontSize: 11, color: p.is_published ? '#15803d' : 'rgba(21,20,15,0.3)' }}>{p.is_published ? '✓ Live' : 'Draft'}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => openEdit(p)} style={{ background: 'transparent', border: '1px solid rgba(21,20,15,0.2)', padding: '6px 12px', ...F, fontSize: 10, cursor: 'pointer', letterSpacing: 1 }}>Edit</button>
                <button onClick={() => remove(p.id)} disabled={deleting === p.id} style={{ background: 'transparent', border: '1px solid #dc2626', color: '#dc2626', padding: '6px 12px', ...F, fontSize: 10, cursor: 'pointer', letterSpacing: 1, opacity: deleting === p.id ? 0.5 : 1 }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: 620, maxHeight: '90vh', overflow: 'auto', padding: 32 }}>
            <h2 style={{ fontFamily: "'Prata',serif", fontSize: 24, color: '#15140f', fontWeight: 400, marginBottom: 24 }}>{editing ? 'Edit Product' : 'Add Product'}</h2>

            <Label>Name *</Label>
            <Input value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} />

            <Label>Description</Label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              style={{ width: '100%', padding: '12px 16px', border: '1px solid rgba(21,20,15,0.22)', fontFamily: "'Raleway',sans-serif", fontSize: 13, color: '#15140f', outline: 'none', minHeight: 80, resize: 'vertical', marginBottom: 16, boxSizing: 'border-box' }} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div><Label>Price (₹) *</Label><Input value={form.price} onChange={v => setForm(f => ({ ...f, price: v }))} type="number" /></div>
              <div><Label>Original Price (₹)</Label><Input value={form.original_price} onChange={v => setForm(f => ({ ...f, original_price: v }))} type="number" /></div>
            </div>

            <Label>Category</Label>
            <Input value={form.category} onChange={v => setForm(f => ({ ...f, category: v }))} />

            {/* Image upload */}
            <Label>Product Images</Label>
            <div style={{ marginBottom: 16 }}>
              {form.images.length > 0 && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                  {form.images.map((url, i) => (
                    <div key={i} style={{ position: 'relative' }}>
                      <img src={url} alt="" style={{ width: 72, height: 96, objectFit: 'cover', objectPosition: 'top', border: '1px solid rgba(21,20,15,0.15)' }} />
                      <button onClick={() => removeImage(i)}
                        style={{ position: 'absolute', top: 2, right: 2, width: 18, height: 18, background: '#dc2626', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 10, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>✕</button>
                      {i === 0 && <div style={{ ...F, fontSize: 7, letterSpacing: 1, textAlign: 'center', color: 'rgba(21,20,15,0.4)', marginTop: 2 }}>PRIMARY</div>}
                    </div>
                  ))}
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f); e.target.value = '' }} />
              <button onClick={() => fileRef.current?.click()} disabled={uploading}
                style={{ padding: '10px 20px', background: 'transparent', border: '1px solid rgba(21,20,15,0.22)', ...F, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', cursor: uploading ? 'wait' : 'pointer', color: 'rgba(21,20,15,0.6)', opacity: uploading ? 0.6 : 1 }}>
                {uploading ? 'Uploading…' : '+ Upload Image'}
              </button>
              <span style={{ ...F, fontSize: 11, color: 'rgba(21,20,15,0.4)', marginLeft: 10 }}>First image = primary. Add multiple for image swap on hover.</span>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontFamily: "'Raleway',sans-serif", fontSize: 13, color: '#15140f' }}>
                <input type="checkbox" checked={form.is_published} onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))} />
                Publish (visible on storefront)
              </label>
            </div>

            <div style={{ marginBottom: 24 }}>
              <Label>Stock by Size</Label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {form.variants.map((v, i) => (
                  <div key={v.size} style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 10, letterSpacing: 1, color: 'rgba(21,20,15,0.55)', marginBottom: 4 }}>{v.size}</div>
                    <input type="number" min={0} value={v.stock_qty}
                      onChange={e => setForm(f => ({ ...f, variants: f.variants.map((x, j) => j === i ? { ...x, stock_qty: parseInt(e.target.value) || 0 } : x) }))}
                      style={{ width: 52, padding: '8px 4px', border: '1px solid rgba(21,20,15,0.22)', textAlign: 'center', fontFamily: "'Raleway',sans-serif", fontSize: 13, outline: 'none' }} />
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={save} disabled={saving} style={{ flex: 1, background: '#0d2818', color: '#e8e4d8', border: 'none', padding: '13px 24px', fontFamily: "'Raleway',sans-serif", fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', cursor: saving ? 'wait' : 'pointer', fontWeight: 600, opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button onClick={() => setModal(false)} style={{ padding: '13px 24px', background: 'transparent', border: '1px solid rgba(21,20,15,0.22)', fontFamily: "'Raleway',sans-serif", fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', cursor: 'pointer', color: 'rgba(21,20,15,0.55)' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(21,20,15,0.55)', marginBottom: 6 }}>{children}</div>
}

function Input({ value, onChange, type = 'text' }: { value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)}
      style={{ width: '100%', padding: '12px 16px', border: '1px solid rgba(21,20,15,0.22)', background: 'transparent', fontFamily: "'Raleway',sans-serif", fontSize: 13, color: '#15140f', outline: 'none', marginBottom: 16, boxSizing: 'border-box' }} />
  )
}
