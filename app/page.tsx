import { createClient } from '@/lib/supabase/server'
import { Nav } from '@/components/Nav'
import { Hero } from '@/components/Hero'
import { ProductsSection } from '@/components/ProductsSection'
import { Philosophy } from '@/components/Philosophy'
import { Footer } from '@/components/Footer'
import { CartDrawer } from '@/components/CartDrawer'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('id, name, slug, price, original_price, badge, product_images(url, is_primary, display_order)')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(6)

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <ProductsSection products={products ?? []} />
        <Philosophy />
        <Footer />
      </main>
      <CartDrawer />
    </>
  )
}
