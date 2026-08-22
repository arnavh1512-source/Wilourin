import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'www.image2url.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
  headers: async () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://*.supabase.co'
    const csp = [
      `default-src 'self'`,
      `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com`,
      `style-src 'self' 'unsafe-inline'`,
      `img-src 'self' data: blob: ${supabaseUrl} https://images.unsplash.com https://www.image2url.com`,
      `font-src 'self' data:`,
      `connect-src 'self' ${supabaseUrl} https://checkout.razorpay.com`,
      `frame-src https://checkout.razorpay.com https://api.razorpay.com`,
      `base-uri 'self'`,
      `form-action 'self'`,
      `frame-ancestors 'none'`,
      `upgrade-insecure-requests`,
    ].join('; ')

    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
    ]
  },
}

export default nextConfig
