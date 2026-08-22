import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient as createAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rateLimit'
import { badRequest, dbError } from '@/lib/apiError'

const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] as const

const listSchema = z.object({
  page: z.coerce.number().int().min(1).max(100000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(STATUSES).optional(),
})

const updateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(STATUSES).optional(),
  tracking_number: z.string().trim().max(100).nullable().optional(),
}).strict().refine(
  v => v.status !== undefined || v.tracking_number !== undefined,
  { message: 'status or tracking_number required' },
)

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  return profile?.role === 'admin' ? user : null
}

export async function GET(req: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const parsed = listSchema.safeParse({
    page: searchParams.get('page') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
    status: searchParams.get('status') || undefined,
  })
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message)

  const { page, limit, status } = parsed.data
  const from = (page - 1) * limit

  const admin = createAdmin()
  let query = admin
    .from('orders')
    .select('*, order_items(*)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1)

  if (status) query = query.eq('status', status)

  const { data, error, count } = await query
  if (error) return dbError('admin:orders', error.message)
  return NextResponse.json({ data, total: count, page, limit })
}

export async function PATCH(req: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!await rateLimit(`admin:orders:${user.id}`, 30, 60_000))
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const parsed = updateSchema.safeParse(await req.json())
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message)

  const { id, status, tracking_number } = parsed.data
  const update: Record<string, unknown> = {}
  if (status !== undefined) update.status = status
  if (tracking_number !== undefined) update.tracking_number = tracking_number || null

  const admin = createAdmin()
  const { data, error } = await admin.from('orders').update(update).eq('id', id).select().single()
  if (error) return dbError('admin:orders', error.message)
  if (!data) return NextResponse.json({ error: 'Order not found.' }, { status: 404 })
  return NextResponse.json({ data })
}
