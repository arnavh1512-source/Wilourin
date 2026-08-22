import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { CartDrawer } from '@/components/CartDrawer'

export const metadata = {
  title: 'Terms of Service — Wilourin',
  description: 'Terms and conditions for using the Wilourin website and purchasing our products.',
}

export default function TermsPage() {
  return (
    <>
      <Nav />
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '80px 24px', fontFamily: "'Raleway',sans-serif", color: '#15140f', lineHeight: 1.7 }}>
        <h1 style={{ fontFamily: "'Prata',serif", fontSize: 32, marginBottom: 40, letterSpacing: 1 }}>Terms of Service</h1>

        <p style={{ fontSize: 13, color: 'rgba(21,20,15,0.55)', marginBottom: 32 }}>Effective Date: June 2026</p>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: "'Prata',serif", fontSize: 18, marginBottom: 12 }}>1. Acceptance of Terms</h2>
          <p>By accessing or using the Wilourin website (wilourin.com), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use our website.</p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: "'Prata',serif", fontSize: 18, marginBottom: 12 }}>2. Products and Pricing</h2>
          <p>All products are subject to availability. Prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise. Wilourin reserves the right to modify prices at any time without prior notice. Prices applicable to your order are those confirmed at the time of purchase.</p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: "'Prata',serif", fontSize: 18, marginBottom: 12 }}>3. Made-to-Order Policy</h2>
          <p>Wilourin products are crafted on a made-to-order basis. Production typically takes up to 3 business days after order confirmation. As each piece is made specifically for you, please review your size and customization choices carefully before placing your order.</p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: "'Prata',serif", fontSize: 18, marginBottom: 12 }}>4. Orders and Payment</h2>
          <p>Orders are confirmed only upon successful payment. Payment is processed securely through our payment gateway partner. Wilourin does not store your payment card details.</p>
          <p style={{ marginTop: 8 }}>We reserve the right to cancel any order if we suspect fraudulent activity or if the product is unavailable.</p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: "'Prata',serif", fontSize: 18, marginBottom: 12 }}>5. Shipping and Delivery</h2>
          <p>We currently ship within India. Delivery timelines are estimates and may vary based on location and logistics. Wilourin is not liable for delays caused by third-party shipping providers.</p>
          <p style={{ marginTop: 8 }}>All orders are prepaid; cash on delivery is not offered. Shipping charges, if any, are calculated and displayed at checkout before payment.</p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: "'Prata',serif", fontSize: 18, marginBottom: 12 }}>6. Exchange Policy</h2>
          <p>Wilourin does not offer returns. Exchanges are permitted within 48 hours of delivery for items that are defective, incorrect, or have sizing issues. Please refer to our <a href="/returns" style={{ color: '#0d2818', textDecoration: 'underline' }}>Returns & Exchange Policy</a> for full details.</p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: "'Prata',serif", fontSize: 18, marginBottom: 12 }}>7. Intellectual Property</h2>
          <p>All content on the Wilourin website — including text, images, logos, designs, and graphics — is the property of Wilourin and is protected by applicable intellectual property laws. You may not reproduce, distribute, or use any content without prior written consent.</p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: "'Prata',serif", fontSize: 18, marginBottom: 12 }}>8. User Accounts</h2>
          <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use. Wilourin is not liable for losses arising from unauthorized access to your account.</p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: "'Prata',serif", fontSize: 18, marginBottom: 12 }}>9. Limitation of Liability</h2>
          <p>Wilourin shall not be liable for any indirect, incidental, or consequential damages arising from your use of the website or purchase of products. Our total liability shall not exceed the amount paid by you for the specific product in question.</p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: "'Prata',serif", fontSize: 18, marginBottom: 12 }}>10. Governing Law</h2>
          <p>These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Ahmedabad, Gujarat.</p>
        </section>

        <section style={{ marginBottom: 80 }}>
          <h2 style={{ fontFamily: "'Prata',serif", fontSize: 18, marginBottom: 12 }}>11. Contact</h2>
          <p>For questions regarding these terms, contact us at <strong>hello@wilourin.com</strong></p>
        </section>
      </main>
      <Footer />
      <CartDrawer />
    </>
  )
}
