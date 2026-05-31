import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient as createAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

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

  const body = await req.json()
  const { name, description, price, original_price, category, is_published, images = [], variants = [] } = body

  if (!name || !price) return NextResponse.json({ error: 'name and price are required' }, { status: 400 })

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
    if (imgErr) return NextResponse.json({ error: `Product saved but image insert failed: ${imgErr.message}` }, { status: 500 })
  }

  if (variants.length) {
    await admin.from('product_variants').insert(
      variants.map((v: { size: string; stock_qty: number }) => ({ product_id: product.id, size: v.size, stock_qty: v.stock_qty ?? 0 }))
    )
  }

  return NextResponse.json({ data: product }, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { id, variants, images, ...rawFields } = body
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  // Convert empty strings to null so they don't overwrite existing DB values with ''
  const productFields = Object.fromEntries(
    Object.entries(rawFields).map(([k, v]) => [k, v === '' ? null : v])
  )

  const admin = createAdmin()
  const { data, error } = await admin.from('products').update(productFields).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (variants) {
    await admin.from('product_variants').delete().eq('product_id', id)
    if (variants.length) {
      await admin.from('product_variants').insert(
        variants.map((v: { size: string; stock_qty: number }) => ({ product_id: id, size: v.size, stock_qty: v.stock_qty ?? 0 }))
      )
    }
  }

  if (images) {
    await admin.from('product_images').delete().eq('product_id', id)
    if (images.length) {
      const { error: imgErr } = await admin.from('product_images').insert(
        images.map((url: string, i: number) => ({ product_id: id, url, is_primary: i === 0, display_order: i }))
      )
      if (imgErr) return NextResponse.json({ error: `Product saved but image insert failed: ${imgErr.message}` }, { status: 500 })
    }
  }

  return NextResponse.json({ data })
}

export async function DELETE(req: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
