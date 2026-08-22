import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient as createAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rateLimit'
import { badRequest, dbError } from '@/lib/apiError'

// Only these columns are readable/writable; the storefront reads the same set.
const SETTINGS_COLUMNS = 'id, hero_video_url, hero_headline, free_shipping_threshold, shipping_cost'

/** A cleared admin input arrives as '' and means "unset this field". */
const blankToNull = (v: unknown) => (v === '' ? null : v)

// These values drive the shipping the customer is actually charged, so they are
// type- and range-checked rather than trusted from the admin form.
const settingsSchema = z.object({
  hero_video_url: z.preprocess(blankToNull, z.string().url().max(500).nullable()).optional(),
  hero_headline: z.preprocess(blankToNull, z.string().trim().max(200).nullable()).optional(),
  free_shipping_threshold: z.number().min(0).max(9999999).optional(),
  shipping_cost: z.number().min(0).max(999999).optional(),
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
  const { data, error } = await admin.from('site_settings').select(SETTINGS_COLUMNS).eq('id', 1).single()
  if (error) return dbError('admin:settings', error.message)
  return NextResponse.json({ data })
}

export async function PATCH(req: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!await rateLimit(`admin:settings:${user.id}`, 20, 60_000))
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const parsed = settingsSchema.safeParse(await req.json())
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message)
  if (Object.keys(parsed.data).length === 0) return badRequest('No settings supplied.')

  const admin = createAdmin()
  const { data, error } = await admin
    .from('site_settings')
    .update(parsed.data)
    .eq('id', 1)
    .select(SETTINGS_COLUMNS)
    .single()

  if (error) return dbError('admin:settings', error.message)
  return NextResponse.json({ data })
}
