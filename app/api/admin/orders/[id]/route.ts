import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient as createAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { dbError } from '@/lib/apiError'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  return profile?.role === 'admin' ? user : null
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  // A malformed id would otherwise surface as a raw Postgres cast error.
  if (!z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  const admin = createAdmin()
  const { data, error } = await admin
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', id)
    .maybeSingle()

  if (error) return dbError('admin:order', error.message)
  if (!data) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  return NextResponse.json({ data })
}
