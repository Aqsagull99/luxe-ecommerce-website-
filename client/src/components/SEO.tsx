import { Helmet } from "react-helmet-async"
import { useLocation } from "react-router-dom"

const BASE_URL = "https://maisonluxe.pk"
const DEFAULT_OG_IMAGE = "https://images.unsplash.com/photo-1618220179428-22790b461013?w=1200&q=90"

interface SEOProps {
  title: string
  description: string
  ogImage?: string
  ogType?: string
  slug?: string
  jsonLd?: Record<string, unknown>
}

export function SEO({ title, description, ogImage, ogType = "website", slug, jsonLd }: SEOProps) {
  const { pathname } = useLocation()
  const canonicalUrl = `${BASE_URL}${slug ? `/${slug}` : pathname}`
  const image = ogImage ?? DEFAULT_OG_IMAGE

  return (
    <Helmet>
      <title>{title} | Maison Luxe</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={`${title} | Maison Luxe`} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={`${title} | Maison Luxe`} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <link rel="canonical" href={canonicalUrl} />
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  )
}
