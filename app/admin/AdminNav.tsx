'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const LINKS = [
  { href: '/admin',           label: 'Dashboard',  icon: '◈' },
  { href: '/admin/products',  label: 'Products',   icon: '◻' },
  { href: '/admin/orders',    label: 'Orders',     icon: '◱' },
  { href: '/admin/customers', label: 'Customers',  icon: '◎' },
  { href: '/admin/settings',  label: 'Settings',   icon: '◆' },
]

export function AdminNav() {
  const pathname = usePathname()
  const router   = useRouter()

  const signOut = async () => {
    await createClient().auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <aside style={{ width: 220, background: '#0d2818', color: '#e8e4d8', display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'sticky', top: 0 }}>
      <div style={{ padding: '28px 24px', borderBottom: '1px solid rgba(232,228,216,0.1)' }}>
        <div style={{ fontFamily: "'Prata',serif", fontSize: 20, color: '#e8e4d8' }}>Wilourin</div>
        <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 9, letterSpacing: 3, color: 'rgba(232,228,216,0.4)', textTransform: 'uppercase', marginTop: 2 }}>Admin Panel</div>
      </div>

      <nav style={{ padding: '16px 0', flex: 1 }}>
        {LINKS.map(({ href, label, icon }) => {
          const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '11px 24px',
                fontFamily: "'Raleway',sans-serif", fontSize: 12, letterSpacing: 1.5,
                textTransform: 'uppercase', textDecoration: 'none',
                color: active ? '#e8e4d8' : 'rgba(232,228,216,0.5)',
                background: active ? 'rgba(232,228,216,0.1)' : 'transparent',
                borderLeft: active ? '2px solid #e8e4d8' : '2px solid transparent',
                transition: 'all 0.2s',
              }}
            >
              <span style={{ fontSize: 14 }}>{icon}</span>
              {label}
            </Link>
          )
        })}
      </nav>

      <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(232,228,216,0.1)' }}>
        <a href="/" style={{ display: 'block', fontFamily: "'Raleway',sans-serif", fontSize: 10, letterSpacing: 2, color: 'rgba(232,228,216,0.4)', textDecoration: 'none', marginBottom: 10, textTransform: 'uppercase' }}>
          ← View site
        </a>
        <button onClick={signOut} style={{ background: 'transparent', border: '1px solid rgba(232,228,216,0.2)', color: 'rgba(232,228,216,0.5)', padding: '8px 16px', fontFamily: "'Raleway',sans-serif", fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', cursor: 'pointer', width: '100%' }}>
          Sign out
        </button>
      </div>
    </aside>
  )
}
