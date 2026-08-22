import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { CartDrawer } from '@/components/CartDrawer'

export const metadata = {
  title: 'Returns & Exchange Policy — Wilourin',
  description: 'Wilourin exchange policy. No returns. Exchanges within 48 hours for defective, incorrect, or size issues.',
}

export default function ReturnsPage() {
  return (
    <>
      <Nav />
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '80px 24px', fontFamily: "'Raleway',sans-serif", color: '#15140f', lineHeight: 1.7 }}>
        <h1 style={{ fontFamily: "'Prata',serif", fontSize: 32, marginBottom: 40, letterSpacing: 1 }}>Returns & Exchange Policy</h1>

        <p style={{ fontSize: 13, color: 'rgba(21,20,15,0.55)', marginBottom: 32 }}>Effective Date: June 2026</p>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: "'Prata',serif", fontSize: 18, marginBottom: 12 }}>1. No Returns</h2>
          <p>We do not accept returns for any orders once delivered. We encourage customers to review product details, sizing, and specifications carefully before placing an order.</p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: "'Prata',serif", fontSize: 18, marginBottom: 12 }}>2. Exchange Eligibility</h2>
          <p>We offer exchanges only under the following conditions:</p>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li>You received a defective or damaged product</li>
            <li>You received an incorrect item</li>
            <li>The size does not fit as expected</li>
          </ul>
          <p style={{ marginTop: 12 }}>All exchange requests must be raised within 48 hours of delivery.</p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: "'Prata',serif", fontSize: 18, marginBottom: 12 }}>3. Exchange Conditions</h2>
          <p>To be eligible for an exchange:</p>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li>The item must be unused, unworn, and unwashed</li>
            <li>All original tags and packaging must be intact</li>
            <li>The product must be in its original condition</li>
          </ul>
          <p style={{ marginTop: 12 }}>Wilourin reserves the right to reject exchanges that do not meet these conditions.</p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: "'Prata',serif", fontSize: 18, marginBottom: 12 }}>4. Exchange Process</h2>
          <p>To request an exchange, contact us at <strong>hello@wilourin.com</strong> with:</p>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li>Order ID</li>
            <li>Reason for exchange</li>
            <li>Clear images of the product (in case of defect/wrong item)</li>
          </ul>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: "'Prata',serif", fontSize: 18, marginBottom: 12 }}>5. Exchange Limitations</h2>
          <ul style={{ paddingLeft: 20 }}>
            <li>Exchanges are allowed once per order</li>
            <li>Exchange is subject to product availability</li>
            <li>If the requested size or item is unavailable, store credit may be issued at our discretion</li>
          </ul>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: "'Prata',serif", fontSize: 18, marginBottom: 12 }}>6. Custom Fit Orders</h2>
          <p>Products ordered with custom fit adjustments are final sale and not eligible for exchange unless defective.</p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: "'Prata',serif", fontSize: 18, marginBottom: 12 }}>7. Shipping for Exchanges</h2>
          <p>In case of defective or incorrect items, Wilourin will cover the shipping cost. In case of size exchange, shipping costs may be applicable.</p>
        </section>

        <section style={{ marginBottom: 80 }}>
          <h2 style={{ fontFamily: "'Prata',serif", fontSize: 18, marginBottom: 12 }}>8. Contact</h2>
          <p>Wilourin<br />Email: hello@wilourin.com</p>
        </section>
      </main>
      <Footer />
      <CartDrawer />
    </>
  )
}
