import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProductClient } from './ProductClient'

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('*, product_images(*), product_variants(*)')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!product) notFound()

  return <ProductClient product={product} />
}
