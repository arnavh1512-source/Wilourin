import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rateLimit'

const MAX_SIZE = 5 * 1024 * 1024 // 5 MB

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const admin = createAdminClient()
  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single()
  return profile?.role === 'admin' ? user : null
}

export async function POST(req: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!await rateLimit(`admin:upload:${user.id}`, 15, 60_000))
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File too large (max 5 MB)' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const header = new Uint8Array(bytes).slice(0, 12)

  const sig = (offset: number, expected: number[]) =>
    expected.every((b, i) => header[offset + i] === b)

  const isJpeg = sig(0, [0xFF, 0xD8, 0xFF])
  const isPng  = sig(0, [0x89, 0x50, 0x4E, 0x47])
  const isWebp = sig(0, [0x52, 0x49, 0x46, 0x46]) && sig(8, [0x57, 0x45, 0x42, 0x50])
  const isGif  = sig(0, [0x47, 0x49, 0x46, 0x38])

  if (!isJpeg && !isPng && !isWebp && !isGif) {
    return NextResponse.json({ error: 'Only JPEG, PNG, WebP, and GIF images are allowed' }, { status: 400 })
  }

  const ext = isPng ? 'png' : isWebp ? 'webp' : isGif ? 'gif' : 'jpg'
  const contentType = isPng ? 'image/png' : isWebp ? 'image/webp' : isGif ? 'image/gif' : 'image/jpeg'
  const fileName = `${Date.now()}-${crypto.randomUUID()}.${ext}`

  const admin = createAdminClient()
  const { error: uploadErr } = await admin.storage
    .from('product-images')
    .upload(fileName, bytes, { contentType, upsert: false })

  if (uploadErr) return NextResponse.json({ error: uploadErr.message }, { status: 500 })

  const { data: { publicUrl } } = admin.storage.from('product-images').getPublicUrl(fileName)
  return NextResponse.json({ url: publicUrl })
}
