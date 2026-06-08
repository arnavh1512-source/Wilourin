import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { CartDrawer } from '@/components/CartDrawer'

export const metadata = {
  title: 'Contact Us — Wilourin',
  description: 'Get in touch with Wilourin for orders, sizing, exchanges, or general inquiries.',
}

export default function ContactPage() {
  return (
    <>
      <Nav />
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '80px 24px', fontFamily: "'Raleway',sans-serif", color: '#15140f', lineHeight: 1.7 }}>
        <h1 style={{ fontFamily: "'Prata',serif", fontSize: 32, marginBottom: 40, letterSpacing: 1 }}>Contact Us</h1>

        <p style={{ marginBottom: 32 }}>At Wilourin, we are committed to providing a seamless experience. If you have any questions regarding orders, sizing, exchanges, or general inquiries, we are here to assist you.</p>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: "'Prata',serif", fontSize: 18, marginBottom: 12 }}>Customer Support</h2>
          <p style={{ fontFamily: "'Raleway',sans-serif" }}>Email: <strong>support@wilourin.com</strong></p>
          <p style={{ fontFamily: "'Raleway',sans-serif" }}>Phone / WhatsApp: <strong>+91 9909538890</strong></p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: "'Prata',serif", fontSize: 18, marginBottom: 12 }}>Business Hours</h2>
          <p>Monday – Saturday<br />10:00 AM – 7:00 PM IST</p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: "'Prata',serif", fontSize: 18, marginBottom: 12 }}>Response Time</h2>
          <p>We aim to respond to all inquiries within 24–48 business hours.</p>
        </section>

        <section style={{ marginBottom: 80 }}>
          <h2 style={{ fontFamily: "'Prata',serif", fontSize: 18, marginBottom: 12 }}>Business Information</h2>
          <p>Wilourin<br />Ahmedabad, Gujarat, India</p>
          <p style={{ marginTop: 12, fontSize: 13, color: 'rgba(21,20,15,0.55)' }}>For order-related inquiries, please include your Order ID in your message to help us assist you faster.</p>
        </section>
      </main>
      <Footer />
      <CartDrawer />
    </>
  )
}
