import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient as createAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rateLimit'
import { badRequest, dbError } from '@/lib/apiError'

const stockSchema = z.object({
  variantId: z.string().uuid(),
  stock_qty: z.number().int().min(0).max(100000),
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
    .from('products')
    .select('id, name, product_variants(id, size, stock_qty)')
    .order('name')

  if (error) return dbError('admin:stock', error.message)
  return NextResponse.json({ data })
}

export async function PATCH(req: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!await rateLimit(`admin:stock:${user.id}`, 30, 60_000))
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const parsed = stockSchema.safeParse(await req.json())
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message)

  const admin = createAdmin()
  const { data, error } = await admin
    .from('product_variants')
    .update({ stock_qty: parsed.data.stock_qty })
    .eq('id', parsed.data.variantId)
    .select('id, size, stock_qty')
    .single()

  if (error) return dbError('admin:stock', error.message)
  if (!data) return NextResponse.json({ error: 'Size not found.' }, { status: 404 })
  return NextResponse.json({ data })
}
