import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { CartDrawer } from '@/components/CartDrawer'

export const metadata = {
  title: 'Privacy Policy — Wilourin',
  description: 'How Wilourin collects, uses, and protects your personal information.',
}

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '80px 24px', fontFamily: "'Raleway',sans-serif", color: '#15140f', lineHeight: 1.7 }}>
        <h1 style={{ fontFamily: "'Prata',serif", fontSize: 32, marginBottom: 40, letterSpacing: 1 }}>Privacy Policy</h1>

        <p style={{ fontSize: 13, color: 'rgba(21,20,15,0.55)', marginBottom: 32 }}>Effective Date: June 2026</p>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: "'Prata',serif", fontSize: 18, marginBottom: 12 }}>1. Information We Collect</h2>
          <p>When you engage with Wilourin, we may collect:</p>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li>Full name</li>
            <li>Email address</li>
            <li>Phone number</li>
            <li>Billing and shipping address</li>
            <li>Payment details (processed securely via Razorpay)</li>
            <li>Device and browsing data (via cookies and analytics)</li>
          </ul>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: "'Prata',serif", fontSize: 18, marginBottom: 12 }}>2. How We Use Your Information</h2>
          <ul style={{ paddingLeft: 20 }}>
            <li>Process and fulfill orders</li>
            <li>Manage shipping and delivery</li>
            <li>Provide customer support</li>
            <li>Improve our website and user experience</li>
            <li>Send updates or offers (only with your consent)</li>
          </ul>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: "'Prata',serif", fontSize: 18, marginBottom: 12 }}>3. Sharing of Information</h2>
          <p>Wilourin does not sell or rent your personal data. We may share information with trusted third parties for operational purposes: payment gateways (Razorpay), logistics partners, and analytics tools.</p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: "'Prata',serif", fontSize: 18, marginBottom: 12 }}>4. Cookies and Tracking</h2>
          <p>We use cookies to enhance browsing and understand user behavior. You may disable cookies through your browser settings.</p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: "'Prata',serif", fontSize: 18, marginBottom: 12 }}>5. Data Security</h2>
          <p>We implement industry-standard measures to protect your information. While no system is entirely immune, we are committed to safeguarding your data with care and diligence.</p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: "'Prata',serif", fontSize: 18, marginBottom: 12 }}>6. Your Rights</h2>
          <p>You have the right to access, correct, or delete your personal data, and to opt out of marketing communications. Contact us at hello@wilourin.com.</p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: "'Prata',serif", fontSize: 18, marginBottom: 12 }}>7. Data Retention</h2>
          <p>We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy, or as required by law (typically 5 years for tax and accounting purposes).</p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: "'Prata',serif", fontSize: 18, marginBottom: 12 }}>8. Grievance Officer</h2>
          <p>In accordance with the Information Technology Act, 2000, our Grievance Officer can be reached at hello@wilourin.com for any concerns regarding data practices.</p>
        </section>

        <section style={{ marginBottom: 80 }}>
          <h2 style={{ fontFamily: "'Prata',serif", fontSize: 18, marginBottom: 12 }}>9. Contact</h2>
          <p>Wilourin<br />Email: hello@wilourin.com</p>
        </section>
      </main>
      <Footer />
      <CartDrawer />
    </>
  )
}
