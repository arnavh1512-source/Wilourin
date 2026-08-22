import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.wilourin.com'

const STATIC_PATHS = ['', '/about', '/contact', '/faq', '/size-guide', '/returns', '/terms', '/privacy']

/**
 * Published products are readable with the anon key, so the sitemap no longer
 * needs the service-role key at build time and degrades to the static routes
 * if Supabase is unreachable (M8).
 */
async function publishedProducts(): Promise<Array<{ slug: string; created_at: string }>> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return []
  try {
    const supabase = createClient(url, key, { auth: { persistSession: false } })
    const { data, error } = await supabase
      .from('products')
      .select('slug, created_at')
      .eq('is_published', true)
    if (error) throw new Error(error.message)
    return data ?? []
  } catch (err) {
    console.error('[sitemap] Falling back to static routes:', err instanceof Error ? err.message : err)
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await publishedProducts()

  return [
    ...STATIC_PATHS.map(path => ({
      url: `${BASE}${path}`,
      lastModified: new Date(),
      changeFrequency: (path === '' ? 'daily' : 'monthly') as 'daily' | 'monthly',
      priority: path === '' ? 1 : 0.5,
    })),
    ...products
      .filter(p => Boolean(p.slug))
      .map(p => ({
        url: `${BASE}/products/${p.slug}`,
        lastModified: new Date(p.created_at),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      })),
  ]
}
