import { createClient } from '@/lib/supabase/server'
import { Nav } from '@/components/Nav'
import { Hero } from '@/components/Hero'
import { ProductsSection } from '@/components/ProductsSection'
import { Philosophy } from '@/components/Philosophy'
import { Footer } from '@/components/Footer'
import { CartDrawer } from '@/components/CartDrawer'

export default async function HomePage() {
  const supabase = await createClient()
  const [{ data: products }, { data: settings }] = await Promise.all([
    supabase
      .from('products')
      .select('id, name, slug, price, original_price, badge, product_images(url, is_primary, display_order), product_variants(id, size, stock_qty)')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(6),
    supabase.from('site_settings').select('hero_video_url').eq('id', 1).single(),
  ])

  return (
    <>
      <Nav />
      <main>
        <Hero videoUrl={settings?.hero_video_url} />
        <ProductsSection products={products ?? []} />
        <Philosophy />
        <Footer />
      </main>
      <CartDrawer />
    </>
  )
}
