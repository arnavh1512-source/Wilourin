import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { CartDrawer } from '@/components/CartDrawer'

export const metadata = {
  title: 'About — Wilourin',
  description: 'Wilourin is a luxury fashion house from Ahmedabad, India — crafting made-to-order garments with artisan precision and modern sensibility.',
}

export default function AboutPage() {
  return (
    <>
      <Nav />
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '80px 24px', fontFamily: "'Raleway',sans-serif", color: '#15140f', lineHeight: 1.7 }}>
        <h1 style={{ fontFamily: "'Prata',serif", fontSize: 32, marginBottom: 40, letterSpacing: 1 }}>About Wilourin</h1>

        <section style={{ marginBottom: 32 }}>
          <p>Wilourin is a luxury fashion house rooted in Ahmedabad, India. We design and craft garments that balance timeless elegance with contemporary sensibility — pieces meant to be worn, cherished, and passed forward.</p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: "'Prata',serif", fontSize: 18, marginBottom: 12 }}>Our Craft</h2>
          <p>Every Wilourin piece is made to order. We do not mass-produce. Each garment is cut, stitched, and finished by skilled artisans in small batches, ensuring attention to detail that factory production cannot match.</p>
          <p style={{ marginTop: 12 }}>Our first collection offers complimentary size customization — because we believe luxury should fit you, not the other way around.</p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: "'Prata',serif", fontSize: 18, marginBottom: 12 }}>Our Values</h2>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li><strong>Intentional design</strong> — We design fewer pieces, better. No trend-chasing, no overproduction.</li>
            <li style={{ marginTop: 8 }}><strong>Artisan-first</strong> — Our garments are handcrafted by skilled artisans who take pride in their work.</li>
            <li style={{ marginTop: 8 }}><strong>Made for you</strong> — Personalized fit adjustments ensure every piece feels like it was made just for you — because it was.</li>
            <li style={{ marginTop: 8 }}><strong>Transparency</strong> — We are honest about our process, our pricing, and our timelines.</li>
          </ul>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: "'Prata',serif", fontSize: 18, marginBottom: 12 }}>Based in Ahmedabad</h2>
          <p>Ahmedabad has a rich textile heritage spanning centuries. Wilourin draws from this legacy while looking outward — bringing Indian craftsmanship to a global audience with modern design and world-class quality.</p>
        </section>

        <section style={{ marginBottom: 80 }}>
          <h2 style={{ fontFamily: "'Prata',serif", fontSize: 18, marginBottom: 12 }}>Get in Touch</h2>
          <p>For inquiries, partnerships, or press, reach us at <strong>hello@wilourin.com</strong></p>
          <p style={{ marginTop: 8 }}>Follow us on <a href="https://www.instagram.com/wilourin" target="_blank" rel="noopener noreferrer" style={{ color: '#0d2818', textDecoration: 'underline' }}>Instagram</a> for updates and behind-the-scenes looks at our process.</p>
        </section>
      </main>
      <Footer />
      <CartDrawer />
    </>
  )
}
