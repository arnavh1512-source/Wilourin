import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient as createAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rateLimit'
import { dbError } from '@/lib/apiError'

// Size labels are free-form so "One Size", "Free Size", "38" etc. are all
// first-class alongside XS–XXL (H5).
const variantSchema = z.object({
  size: z.string().trim().min(1).max(30),
  stock_qty: z.number().int().min(0).max(100000).optional().default(0),
})

const productSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().max(2000).optional().default(''),
  price: z.number().positive().max(999999),
  original_price: z.number().positive().max(999999).nullable().optional(),
  category: z.string().max(100).nullable().optional(),
  badge: z.string().max(100).nullable().optional(),
  is_published: z.boolean().optional().default(false),
  images: z.array(z.string().url()).max(20).optional().default([]),
  variants: z.array(variantSchema).max(40).optional().default([]),
})

const patchSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  price: z.number().positive().max(999999).optional(),
  original_price: z.number().positive().max(999999).nullable().optional(),
  category: z.string().max(100).nullable().optional(),
  badge: z.string().max(100).nullable().optional(),
  is_published: z.boolean().optional(),
  images: z.array(z.string().url()).max(20).optional(),
  variants: z.array(variantSchema).max(40).optional(),
})

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  return profile?.role === 'admin' ? user : null
}

/** Turns a Postgres error from the product RPCs into a user-facing message. */
function rpcError(message: string | undefined): NextResponse {
  const msg = message ?? 'Unknown database error'
  if (msg.includes('needs at least one image')) {
    return NextResponse.json({ error: 'A published product needs at least one image.' }, { status: 400 })
  }
  if (msg.includes('alphanumeric')) {
    return NextResponse.json({ error: 'Product name must contain at least one letter or number.' }, { status: 400 })
  }
  if (msg.includes('not found')) {
    return NextResponse.json({ error: 'Product not found.' }, { status: 404 })
  }
  console.error('[admin:products] RPC failed:', msg)
  return NextResponse.json({ error: 'Could not save the product.' }, { status: 500 })
}

/** Rejects duplicate size labels before they reach the database. */
function duplicateSize(variants: { size: string }[] | undefined): string | null {
  if (!variants) return null
  const seen = new Set<string>()
  for (const v of variants) {
    const key = v.size.trim().toLowerCase()
    if (seen.has(key)) return v.size
    seen.add(key)
  }
  return null
}

export async function GET() {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdmin()
  const { data, error } = await admin
    .from('products')
    .select('*, product_images(*), product_variants(*)')
    .order('created_at', { ascending: false })

  if (error) return dbError('admin:products', error.message)
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!(await rateLimit(`admin:products:${user.id}`, 20, 60_000)))
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const parsed = productSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })

  const { images, variants, ...fields } = parsed.data

  const dupe = duplicateSize(variants)
  if (dupe) return NextResponse.json({ error: `Duplicate size "${dupe}".` }, { status: 400 })

  const admin = createAdmin()
  // Product, images and variants are written in one transaction (H6).
  const { data, error } = await admin.rpc('create_product', {
    p_product: fields,
    p_images: images.map((url, i) => ({ url, is_primary: i === 0, display_order: i })),
    p_variants: variants.map(v => ({ size: v.size, stock_qty: v.stock_qty ?? 0 })),
  })

  if (error) return rpcError(error.message)
  return NextResponse.json({ data }, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!(await rateLimit(`admin:products:${user.id}`, 20, 60_000)))
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const parsed = patchSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })

  const { id, variants, images, ...fields } = parsed.data

  const dupe = duplicateSize(variants)
  if (dupe) return NextResponse.json({ error: `Duplicate size "${dupe}".` }, { status: 400 })

  const admin = createAdmin()
  // Passing null for images/variants leaves them untouched (H6).
  const { data, error } = await admin.rpc('update_product', {
    p_id: id,
    p_product: fields,
    p_images: images ? images.map((url, i) => ({ url, is_primary: i === 0, display_order: i })) : null,
    p_variants: variants ? variants.map(v => ({ size: v.size, stock_qty: v.stock_qty ?? 0 })) : null,
  })

  if (error) return rpcError(error.message)
  return NextResponse.json({ data })
}

export async function DELETE(req: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!(await rateLimit(`admin:products:${user.id}`, 20, 60_000)))
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const parsed = z.object({ id: z.string().uuid() }).strict().safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: 'A valid product id is required.' }, { status: 400 })
  const { id } = parsed.data

  const admin = createAdmin()

  // Block delete if product has order history
  const { data: orderItems } = await admin.from('order_items').select('id').eq('product_id', id).limit(1)
  if (orderItems?.length) {
    return NextResponse.json({ error: 'Cannot delete a product that has order history. Unpublish it instead.' }, { status: 409 })
  }

  // Clean up storage images before deleting
  const { data: images } = await admin.from('product_images').select('url').eq('product_id', id)
  for (const img of images ?? []) {
    const path = img.url.split('/').pop()
    if (path) await admin.storage.from('product-images').remove([path])
  }

  const { error } = await admin.from('products').delete().eq('id', id)
  if (error) return dbError('admin:products', error.message)
  return NextResponse.json({ success: true })
}
