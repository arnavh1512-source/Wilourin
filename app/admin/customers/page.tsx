'use client'

import { useEffect, useState } from 'react'

interface Customer {
  id: string
  full_name: string | null
  phone: string | null
  role: string
  created_at: string
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/customers')
    const json = await res.json()
    setCustomers(json.data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const toggleRole = async (id: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'customer' : 'admin'
    if (!confirm(`Change role to ${newRole}?`)) return
    setUpdating(id)
    await fetch('/api/admin/customers', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, role: newRole }) })
    setUpdating(null)
    setCustomers(cs => cs.map(c => c.id === id ? { ...c, role: newRole } : c))
  }

  const F = { fontFamily: "'Raleway',sans-serif" }

  const admins = customers.filter(c => c.role === 'admin')
  const regular = customers.filter(c => c.role !== 'admin')

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Prata',serif", fontSize: 32, color: '#15140f', fontWeight: 400, margin: 0 }}>Customers</h1>
        <p style={{ ...F, fontSize: 13, color: 'rgba(21,20,15,0.55)', marginTop: 4 }}>{customers.length} total · {admins.length} admin · {regular.length} customers</p>
      </div>

      {loading ? (
        <div style={{ ...F, fontSize: 13, color: 'rgba(21,20,15,0.4)', textAlign: 'center', padding: 60 }}>Loading…</div>
      ) : (
        <>
          {admins.length > 0 && (
            <div style={{ marginBottom: 40 }}>
              <div style={{ ...F, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(21,20,15,0.5)', marginBottom: 16 }}>Admins</div>
              <CustomerTable customers={admins} onToggle={toggleRole} updating={updating} />
            </div>
          )}

          <div>
            <div style={{ ...F, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(21,20,15,0.5)', marginBottom: 16 }}>Customers</div>
            {regular.length === 0 ? (
              <div style={{ ...F, fontSize: 13, color: 'rgba(21,20,15,0.4)', textAlign: 'center', padding: 40 }}>No customers yet.</div>
            ) : (
              <CustomerTable customers={regular} onToggle={toggleRole} updating={updating} />
            )}
          </div>
        </>
      )}
    </div>
  )
}

function CustomerTable({ customers, onToggle, updating }: { customers: Customer[]; onToggle: (id: string, role: string) => void; updating: string | null }) {
  const F = { fontFamily: "'Raleway',sans-serif" }
  return (
    <div style={{ background: '#fff', border: '1px solid rgba(21,20,15,0.12)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', padding: '10px 20px', borderBottom: '1px solid rgba(21,20,15,0.1)', ...F, fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(21,20,15,0.45)' }}>
        <span>Name</span><span>Phone</span><span>Joined</span><span>Role</span>
      </div>
      {customers.map(c => (
        <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', padding: '14px 20px', borderBottom: '1px solid rgba(21,20,15,0.06)', alignItems: 'center' }}>
          <div style={{ ...F, fontSize: 13, color: '#15140f', fontWeight: 600 }}>{c.full_name || '—'}</div>
          <div style={{ ...F, fontSize: 12, color: 'rgba(21,20,15,0.55)' }}>{c.phone || '—'}</div>
          <div style={{ ...F, fontSize: 12, color: 'rgba(21,20,15,0.55)' }}>
            {new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
          <button
            onClick={() => onToggle(c.id, c.role)}
            disabled={updating === c.id}
            style={{
              padding: '6px 14px', border: `1px solid ${c.role === 'admin' ? '#dc2626' : 'rgba(21,20,15,0.2)'}`,
              background: 'transparent', color: c.role === 'admin' ? '#dc2626' : 'rgba(21,20,15,0.6)',
              ...F, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer',
              opacity: updating === c.id ? 0.5 : 1,
            }}
          >
            {c.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
          </button>
        </div>
      ))}
    </div>
  )
}
