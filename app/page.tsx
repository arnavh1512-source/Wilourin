import { createClient } from '@/lib/supabase/server'
import { Nav } from '@/components/Nav'
import { Hero } from '@/components/Hero'
import { ProductsSection } from '@/components/ProductsSection'
import { Philosophy } from '@/components/Philosophy'
import { Footer } from '@/components/Footer'
import { CartDrawer } from '@/components/CartDrawer'

export default async function HomePage({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
  const supabase = await createClient()
  const { search } = await searchParams

  let query = supabase
    .from('products')
    .select('id, name, slug, price, original_price, badge, product_images(url, is_primary, display_order), product_variants(id, size, stock_qty)')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(search?.trim() ? 20 : 6)

  if (search?.trim()) {
    const escaped = search.trim().replace(/[%_\\]/g, '\\$&')
    query = query.ilike('name', `%${escaped}%`)
  }

  const [{ data: products }, { data: settings }] = await Promise.all([
    query,
    supabase.from('site_settings').select('hero_video_url').eq('id', 1).single(),
  ])

  return (
    <>
      <Nav />
      <main>
        {!search?.trim() && <Hero videoUrl={settings?.hero_video_url} />}
        <ProductsSection products={products ?? []} searchQuery={search?.trim()} />
        {!search?.trim() && <Philosophy />}
        <Footer />
      </main>
      <CartDrawer />
    </>
  )
}
