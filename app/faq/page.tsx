import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { CartDrawer } from '@/components/CartDrawer'

export const metadata = {
  title: 'FAQs — Wilourin',
  description: 'Frequently asked questions about Wilourin orders, shipping, production, and more.',
}

const S = {
  section: { marginBottom: 48 } as React.CSSProperties,
  sectionTitle: { fontFamily: "'Prata',serif", fontSize: 20, marginBottom: 24, letterSpacing: 1, borderBottom: '1px solid rgba(21,20,15,0.15)', paddingBottom: 12 } as React.CSSProperties,
  q: { fontWeight: 700 as const, fontSize: 15, marginBottom: 6, marginTop: 24, color: '#15140f' } as React.CSSProperties,
  a: { marginBottom: 16, color: 'rgba(21,20,15,0.78)' } as React.CSSProperties,
}

export default function FAQPage() {
  return (
    <>
      <Nav />
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '80px 24px', fontFamily: "'Raleway',sans-serif", color: '#15140f', lineHeight: 1.7 }}>
        <h1 style={{ fontFamily: "'Prata',serif", fontSize: 32, marginBottom: 48, letterSpacing: 1 }}>Frequently Asked Questions</h1>

        {/* General */}
        <section style={S.section}>
          <h2 style={S.sectionTitle}>General</h2>

          <p style={S.q}>The product I want is out of stock — when will it be available?</p>
          <p style={S.a}>With the exception of limited edition items, we&apos;re working on restocking all of our out of stock sizes and styles. You can join our Wilourin Instagram community to stay informed on when they&apos;ll be back in stock.</p>

          <p style={S.q}>For Collaboration Inquiries</p>
          <p style={S.a}>Thank you so much for your interest! For all partnership, influencer, or press inquiries, please email <strong>hello@wilourin.com</strong></p>

          <p style={S.q}>I emailed customer service, but I haven&apos;t heard back.</p>
          <p style={S.a}>Our Support Team is happy to help with any concerns you may have! Sometimes our emails get filtered into Spam inboxes, so make sure you check yours. You can also add hello@wilourin.com to your email whitelist. If you&apos;re having any issues hearing back from us over email, please don&apos;t hesitate to give us a call on <strong style={{ fontFamily: 'system-ui, sans-serif' }}>+91 9909538890</strong></p>

          <p style={S.q}>I would like to work for Wilourin!</p>
          <p style={S.a}>Thank you so much for your interest in working with us! Please send us your CV on <strong>hello@wilourin.com</strong> and if your profile is suitable, we will get back to you. Please note that we will not be able to respond to every single application.</p>
        </section>

        {/* Order and Delivery */}
        <section style={S.section}>
          <h2 style={S.sectionTitle}>Order &amp; Delivery</h2>

          <p style={S.q}>Can I change my order?</p>
          <p style={S.a}>Once an order is submitted, we would be unable to change the order after it has been dispatched. So in case you&apos;d like to change your order, please contact us as soon as possible at <strong>hello@wilourin.com</strong></p>

          <p style={S.q}>Can I cancel my order?</p>
          <p style={S.a}>Once an order is submitted, we would be unable to cancel the order after it has been dispatched. So in case you&apos;d like to cancel your order, please contact us as soon as possible at <strong>hello@wilourin.com</strong></p>

          <p style={S.q}>Can I change my delivery address?</p>
          <p style={S.a}>Once an order is submitted, we would be unable to change the delivery address after it has been dispatched. So in case you&apos;d like to make any such changes, please contact us as soon as possible at <strong>hello@wilourin.com</strong></p>
        </section>

        {/* Shipping */}
        <section style={S.section}>
          <h2 style={S.sectionTitle}>Shipping</h2>

          <p style={S.q}>How quick do you ship?</p>
          <div style={S.a}>
            <p>Once an order is placed, it enters our production process. As Wilourin&apos;s first collection is crafted on a made-to-order and customization basis, pieces are not kept as ready-to-wear inventory.</p>
            <p style={{ marginTop: 8 }}>Production typically takes up to 3 business days, after which your order will be dispatched.</p>
            <p style={{ marginTop: 8 }}>Once dispatched, orders are usually handed over to our shipping partner within 24 hours. Delivery may take anywhere between 2 to 14 business days, depending on your location.</p>
            <p style={{ marginTop: 8 }}>Please note that delivery is managed by third-party logistics providers. While we strive to ensure timely delivery, we cannot guarantee exact delivery timelines as unforeseen delays may occasionally occur during transit.</p>
            <p style={{ marginTop: 8 }}>Once your order has been dispatched, tracking details will be shared via email and/or WhatsApp, allowing you to monitor your shipment&apos;s progress.</p>
            <p style={{ marginTop: 8 }}>We appreciate your patience and support as each Wilourin piece is thoughtfully crafted for you.</p>
          </div>

          <p style={S.q}>Is shipping free?</p>
          <p style={S.a}>Shipping is free on orders above the free-shipping threshold shown in your bag. Below it, a flat shipping charge applies, and the exact amount is displayed at checkout before you pay. We currently accept prepaid orders only — cash on delivery is not available.</p>

          <p style={S.q}>Do you ship internationally?</p>
          <p style={S.a}>As of now, we only deliver in India.</p>

          <p style={S.q}>My order is delayed, what should I do?</p>
          <p style={S.a}>Often, shipping carriers will notify you when your parcel is expected to be delivered late. If your order has been stuck in transit for more than two weeks, please call us at <strong style={{ fontFamily: 'system-ui, sans-serif' }}>+91 9909538890</strong> or email us at <strong>hello@wilourin.com</strong> and we will sort it out for you.</p>

          <p style={S.q}>I made a mistake in the delivery address, what do I do?</p>
          <p style={S.a}>If there&apos;s an error in your delivery address, please call us at <strong style={{ fontFamily: 'system-ui, sans-serif' }}>+91 9909538890</strong> as soon as possible. We will only be able to modify your delivery address before your order leaves our facility. Once the order has been shipped, we will not be able to change the delivery address.</p>

          <p style={S.q}>My order says it has been delivered but I don&apos;t have it.</p>
          <p style={S.a}>Oh no, we&apos;re sorry to hear this! Please send an email over to <strong>hello@wilourin.com</strong> with your order details so we can help you out.</p>
        </section>

        {/* Production */}
        <section style={S.section}>
          <h2 style={S.sectionTitle}>Production &amp; Product</h2>

          <p style={S.q}>Are Wilourin garments size-inclusive?</p>
          <div style={S.a}>
            <p>Yes. Wilourin offers a range of standard sizes to accommodate different body types. Please refer to our <a href="/size-guide" style={{ color: '#0d2818', textDecoration: 'underline' }}>Size Guide</a> to find your best fit.</p>
            <p style={{ marginTop: 8 }}>If you require a size outside our standard size range or would like a more personalized fit, we also offer customization services. Customized sizing is available at an additional cost and will be treated as a custom order.</p>
            <p style={{ marginTop: 8 }}>As part of our launch, customized sizing for the First Collection is offered at no additional charge. Future collections may be subject to customization fees.</p>
          </div>

          <p style={S.q}>How do I wash and care for my Wilourin garment?</p>
          <p style={S.a}>Care instructions may vary depending on the fabric and construction of each piece. Specific washing and care guidelines can be found in the product description and care label provided with your garment. We recommend following the stated care instructions carefully to maintain the quality, fit, and longevity of your Wilourin piece.</p>

          <p style={S.q}>Do you make custom orders?</p>
          <div style={S.a}>
            <p>At present, Wilourin does not generally accept custom design orders.</p>
            <p style={{ marginTop: 8 }}>However, as part of our First Collection launch, we offer complimentary size customization to ensure a better fit for our customers.</p>
            <p style={{ marginTop: 8 }}>If you require a custom order beyond our standard offerings, you may submit your request by emailing us at <strong>hello@wilourin.com</strong>. Custom orders are reviewed on a case-by-case basis and may be subject to additional charges.</p>
            <p style={{ marginTop: 8 }}>Please note that acceptance of custom orders is solely at Wilourin&apos;s discretion.</p>
          </div>

          <p style={S.q}>The colour of the product I received is slightly different from the images. Why?</p>
          <p style={S.a}>The photos of every product are clicked in different light settings. We try to take pictures in a setting that is the closest to what the product looks like in reality. However, there are times when the camera lens cannot match the perspective of the eye and thus slight colour differences are unavoidable. Since our products are also not machine made in large quantities but in fact made by an artisan and in small batches, each batch could have a slight difference in the shade of the colour due to the human involvement in the process.</p>
        </section>
      </main>
      <Footer />
      <CartDrawer />
    </>
  )
}
