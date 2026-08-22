import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient as createAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rateLimit'

const productSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional().default(''),
  price: z.number().positive().max(999999),
  original_price: z.number().positive().max(999999).nullable().optional(),
  category: z.string().max(100).nullable().optional(),
  is_published: z.boolean().optional().default(false),
  images: z.array(z.string().url()).max(20).optional().default([]),
  variants: z.array(z.object({
    size: z.string().min(1).max(10),
    stock_qty: z.number().int().min(0).max(100000).optional().default(0),
  })).max(20).optional().default([]),
})

const patchSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  price: z.number().positive().max(999999).optional(),
  original_price: z.number().positive().max(999999).nullable().optional(),
  category: z.string().max(100).nullable().optional(),
  badge: z.string().max(100).nullable().optional(),
  is_published: z.boolean().optional(),
  images: z.array(z.string().url()).max(20).optional(),
  variants: z.array(z.object({
    size: z.string().min(1).max(10),
    stock_qty: z.number().int().min(0).max(100000).optional().default(0),
  })).max(20).optional(),
})

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  return profile?.role === 'admin' ? user : null
}

function toSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

async function uniqueSlug(base: string, admin: ReturnType<typeof createAdmin>): Promise<string> {
  let slug = base
  let n = 2
  let attempts = 0
  while (attempts++ < 100) {
    const { data } = await admin.from('products').select('id').eq('slug', slug).maybeSingle()
    if (!data) return slug
    slug = `${base}-${n++}`
  }
  throw new Error('Could not generate unique slug after 100 attempts')
}

export async function GET() {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdmin()
  const { data, error } = await admin
    .from('products')
    .select('*, product_images(*), product_variants(*)')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!await rateLimit(`admin:products:${user.id}`, 20, 60_000))
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const parsed = productSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })

  const { name, description, price, original_price, category, is_published, images, variants } = parsed.data

  const admin = createAdmin()
  const slug = await uniqueSlug(toSlug(name), admin)
  const { data: product, error } = await admin
    .from('products')
    .insert({ name, slug, description, price, original_price: original_price || null, category: category || null, is_published: !!is_published })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (images.length) {
    const { error: imgErr } = await admin.from('product_images').insert(
      images.map((url: string, i: number) => ({ product_id: product.id, url, is_primary: i === 0, display_order: i }))
    )
    if (imgErr) {
      await admin.from('products').delete().eq('id', product.id)
      return NextResponse.json({ error: `Failed to create images: ${imgErr.message}` }, { status: 500 })
    }
  }

  if (variants.length) {
    const { error: varErr } = await admin.from('product_variants').insert(
      variants.map((v: { size: string; stock_qty: number }) => ({ product_id: product.id, size: v.size, stock_qty: v.stock_qty ?? 0 }))
    )
    if (varErr) {
      await admin.from('product_images').delete().eq('product_id', product.id)
      await admin.from('products').delete().eq('id', product.id)
      return NextResponse.json({ error: `Failed to create variants: ${varErr.message}` }, { status: 500 })
    }
  }

  return NextResponse.json({ data: product }, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!await rateLimit(`admin:products:${user.id}`, 20, 60_000))
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const parsed = patchSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })

  const { id, variants, images, ...fields } = parsed.data
  const productFields = Object.fromEntries(
    Object.entries(fields).map(([k, v]) => [k, v === '' ? null : v])
  )

  const admin = createAdmin()
  const { data, error } = await admin.from('products').update(productFields).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (variants) {
    const { error: delVarErr } = await admin.from('product_variants').delete().eq('product_id', id)
    if (delVarErr) return NextResponse.json({ error: `Failed to clear variants: ${delVarErr.message}` }, { status: 500 })
    if (variants.length) {
      const { error: varErr } = await admin.from('product_variants').insert(
        variants.map((v: { size: string; stock_qty: number }) => ({ product_id: id, size: v.size, stock_qty: v.stock_qty ?? 0 }))
      )
      if (varErr) return NextResponse.json({ error: `Failed to update variants: ${varErr.message}` }, { status: 500 })
    }
  }

  if (images) {
    const { error: delImgErr } = await admin.from('product_images').delete().eq('product_id', id)
    if (delImgErr) return NextResponse.json({ error: `Failed to clear images: ${delImgErr.message}` }, { status: 500 })
    if (images.length) {
      const { error: imgErr } = await admin.from('product_images').insert(
        images.map((url: string, i: number) => ({ product_id: id, url, is_primary: i === 0, display_order: i }))
      )
      if (imgErr) return NextResponse.json({ error: `Failed to update images: ${imgErr.message}` }, { status: 500 })
    }
  }

  return NextResponse.json({ data })
}

export async function DELETE(req: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!await rateLimit(`admin:products:${user.id}`, 20, 60_000))
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

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
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
