import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminNav } from './AdminNav'

export const metadata = { title: 'Admin — Wilourin' }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/admin')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/')

  return (
    <div style={{ minHeight: '100vh', background: '#f8f7f4', display: 'flex' }}>
      <AdminNav />
      <main style={{ flex: 1, padding: '32px 40px', overflow: 'auto' }}>{children}</main>
    </div>
  )
}
