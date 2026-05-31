import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { ProductClient } from './ProductClient'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('name, description, product_images(url, is_primary)')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!data) return { title: 'Wilourin' }

  const image = data.product_images?.find((i: { is_primary: boolean }) => i.is_primary)?.url
  return {
    title: `${data.name} — Wilourin`,
    description: data.description ?? 'Luxury fashion crafted with intention.',
    openGraph: {
      title: `${data.name} — Wilourin`,
      description: data.description ?? 'Luxury fashion crafted with intention.',
      images: image ? [{ url: image }] : [],
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: product, error } = await supabase
    .from('products')
    .select('id, name, slug, description, price, original_price, badge, product_images(*), product_variants(*)')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (error) console.error('Product fetch error:', error.message)
  if (error || !product) notFound()

  return <ProductClient product={product} />
}
