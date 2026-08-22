import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient as createAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rateLimit'
import { badRequest, dbError } from '@/lib/apiError'

// Explicit column list so future PII columns are not exposed by accident.
const CUSTOMER_COLUMNS = 'id, full_name, phone, role, created_at'

const roleSchema = z.object({
  id: z.string().uuid(),
  role: z.enum(['admin', 'customer']),
}).strict()

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  return profile?.role === 'admin' ? user : null
}

export async function GET() {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdmin()
  const { data, error } = await admin
    .from('profiles')
    .select(CUSTOMER_COLUMNS)
    .order('created_at', { ascending: false })

  if (error) return dbError('admin:customers', error.message)
  return NextResponse.json({ data })
}

export async function PATCH(req: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!await rateLimit(`admin:customers:${user.id}`, 20, 60_000))
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const parsed = roleSchema.safeParse(await req.json())
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message)

  const { id, role } = parsed.data
  // An admin demoting themselves would lock the panel behind nobody.
  if (id === user.id) return badRequest('Cannot change your own role.')

  const admin = createAdmin()
  const { data, error } = await admin
    .from('profiles')
    .update({ role })
    .eq('id', id)
    .select(CUSTOMER_COLUMNS)
    .single()

  if (error) return dbError('admin:customers', error.message)
  if (!data) return NextResponse.json({ error: 'Customer not found.' }, { status: 404 })
  return NextResponse.json({ data })
}
