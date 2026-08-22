import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient as createAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rateLimit'
import { badRequest, dbError } from '@/lib/apiError'
import { attemptRefund, type RefundRow } from '@/lib/refunds'

const REFUND_COLUMNS =
  'id, order_id, razorpay_payment_id, razorpay_refund_id, amount, reason, status, attempts, last_error, created_at, updated_at'

const actionSchema = z.object({
  id: z.string().uuid(),
  // 'retry' re-sends it to Razorpay; 'resolved' closes a refund settled by hand.
  action: z.enum(['retry', 'resolved']),
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
    .from('refunds')
    .select(REFUND_COLUMNS)
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) return dbError('admin:refunds', error.message)
  return NextResponse.json({ data })
}

export async function PATCH(req: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  // Deliberately tight: each call can move real money.
  if (!await rateLimit(`admin:refunds:${user.id}`, 10, 60_000))
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const parsed = actionSchema.safeParse(await req.json())
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message)
  const { id, action } = parsed.data

  const admin = createAdmin()
  const { data: refund, error } = await admin
    .from('refunds')
    .select(REFUND_COLUMNS)
    .eq('id', id)
    .maybeSingle<RefundRow>()

  if (error) return dbError('admin:refunds', error.message)
  if (!refund) return NextResponse.json({ error: 'Refund not found.' }, { status: 404 })
  if (refund.status === 'refunded') return badRequest('That refund has already been paid out.')

  if (action === 'resolved') {
    const { data, error: updateError } = await admin
      .from('refunds')
      .update({ status: 'resolved', updated_at: new Date().toISOString() })
      .eq('id', id)
      .neq('status', 'refunded')
      .select(REFUND_COLUMNS)
      .maybeSingle()
    if (updateError) return dbError('admin:refunds', updateError.message)
    if (!data) return badRequest('That refund has already been paid out.')
    return NextResponse.json({ data })
  }

  const paid = await attemptRefund(admin, refund)
  const { data } = await admin.from('refunds').select(REFUND_COLUMNS).eq('id', id).single()
  return NextResponse.json({ data, refunded: paid }, { status: paid ? 200 : 502 })
}
