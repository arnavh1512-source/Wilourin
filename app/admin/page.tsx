import { createClient } from '@/lib/supabase/server'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [
    { count: totalProducts },
    { count: totalOrders },
    { count: totalCustomers },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
    supabase.from('orders').select('id,status,total,created_at,shipping_name').order('created_at', { ascending: false }).limit(5),
  ])

  const stats = [
    { label: 'Products', value: totalProducts ?? 0, href: '/admin/products' },
    { label: 'Orders',   value: totalOrders   ?? 0, href: '/admin/orders' },
    { label: 'Customers',value: totalCustomers ?? 0, href: '/admin/customers' },
  ]

  const STATUS_COLOR: Record<string, string> = {
    pending: '#92400e', confirmed: '#1d4ed8', processing: '#6d28d9',
    shipped: '#0369a1', delivered: '#15803d', cancelled: '#dc2626',
  }

  return (
    <div>
      <h1 style={{ fontFamily: "'Prata',serif", fontSize: 32, color: '#15140f', marginBottom: 8, fontWeight: 400 }}>Dashboard</h1>
      <p style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13, color: 'rgba(21,20,15,0.55)', marginBottom: 40 }}>
        Welcome back. Here&apos;s what&apos;s happening.
      </p>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 48 }}>
        {stats.map((s) => (
          <a key={s.label} href={s.href} style={{ background: '#fff', border: '1px solid rgba(21,20,15,0.12)', padding: 24, textDecoration: 'none', transition: 'box-shadow 0.2s', display: 'block' }}>
            <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 9, letterSpacing: 3, color: 'rgba(21,20,15,0.5)', textTransform: 'uppercase', marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontFamily: "'Prata',serif", fontSize: 40, color: '#15140f' }}>{s.value}</div>
          </a>
        ))}
      </div>

      {/* Recent Orders */}
      <div>
        <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(21,20,15,0.5)', marginBottom: 16 }}>Recent Orders</div>
        <div style={{ background: '#fff', border: '1px solid rgba(21,20,15,0.12)' }}>
          {!recentOrders?.length ? (
            <div style={{ padding: 32, textAlign: 'center', fontFamily: "'Raleway',sans-serif", fontSize: 13, color: 'rgba(21,20,15,0.4)' }}>No orders yet</div>
          ) : (
            recentOrders.map((o) => (
              <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid rgba(21,20,15,0.08)' }}>
                <div>
                  <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: '#15140f', fontWeight: 600 }}>
                    {o.shipping_name || 'Guest'} — #{(o.id as string).slice(0,8).toUpperCase()}
                  </div>
                  <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, color: 'rgba(21,20,15,0.5)', marginTop: 2 }}>
                    {new Date(o.created_at as string).toLocaleDateString('en-IN')}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ color: STATUS_COLOR[o.status as string] ?? '#374151', fontFamily: "'Raleway',sans-serif", fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 700 }}>{o.status as string}</span>
                  <span style={{ fontFamily: "'Prata',serif", fontSize: 16, color: '#15140f' }}>₹{Number(o.total).toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))
          )}
        </div>
        <a href="/admin/orders" style={{ display: 'inline-block', marginTop: 12, fontFamily: "'Raleway',sans-serif", fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(21,20,15,0.55)', textDecoration: 'underline' }}>
          View all orders →
        </a>
      </div>
    </div>
  )
}
