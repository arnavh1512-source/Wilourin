import { Nav } from '@/components/Nav'
import { Hero } from '@/components/Hero'
import { ProductsSection } from '@/components/ProductsSection'
import { Philosophy } from '@/components/Philosophy'
import { Footer } from '@/components/Footer'
import { CartDrawer } from '@/components/CartDrawer'

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <ProductsSection />
        <Philosophy />
        <Footer />
      </main>
      <CartDrawer />
    </>
  )
}
