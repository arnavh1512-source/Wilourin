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
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now().toString(36)
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
  const { data: product, error } = await admin
    .from('products')
    .insert({ name, slug: toSlug(name), description, price, original_price: original_price || null, category: category || null, is_published: !!is_published })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (images.length) {
    await admin.from('product_images').insert(
      images.map((url: string, i: number) => ({ product_id: product.id, url, is_primary: i === 0, display_order: i }))
    )
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

  return NextResponse.json({ data })
}

export async function DELETE(req: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const admin = createAdmin()
  const { error } = await admin.from('products').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
