import type { Metadata } from 'next'
import { Prata, Raleway } from 'next/font/google'
import './globals.css'

const prata = Prata({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-prata',
  display: 'swap',
})

const raleway = Raleway({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600'],
  variable: '--font-raleway',
  display: 'swap',
})

export const metadata: Metadata = {
  title: { default: 'Wilourin — Worn slowly.', template: '%s — Wilourin' },
  description: "Clothes that don't shout. Luxury fashion crafted with intention, from Ahmedabad.",
  keywords: ['luxury fashion', 'Wilourin', 'Indian fashion', 'slow fashion', 'Ahmedabad'],
  openGraph: {
    type: 'website',
    siteName: 'Wilourin',
    title: "Wilourin — Worn slowly.",
    description: "Clothes that don't shout.",
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${prata.variable} ${raleway.variable}`} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
