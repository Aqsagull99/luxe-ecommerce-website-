import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart, ShoppingBag, Star, ChevronLeft, ChevronRight,
  ZoomIn, Minus, Plus, Truck, RotateCcw, Shield, Share2, Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProductCard } from '@/components/products/ProductCard'
import { supabase, type Product, type Review } from '@/lib/supabase'
import { useCartStore } from '@/store/useCartStore'
import { useWishlistStore } from '@/store/useWishlistStore'
import { cn } from '@/lib/utils'

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [related, setRelated] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [zoomed, setZoomed] = useState(false)
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 })

  const addItem = useCartStore((s) => s.addItem)
  const { toggle, has } = useWishlistStore()

  useEffect(() => {
    if (!slug) return
    void (async () => {
      setLoading(true)
      const { data: prod } = await supabase
        .from('products')
        .select('*, images:product_images(*), category:categories(*), variants:product_variants(*)')
        .eq('slug', slug)
        .single()

      if (!prod) { navigate('/products'); return }
      setProduct(prod as Product)

      const [revRes, relRes] = await Promise.all([
        supabase
          .from('product_reviews')
          .select('*, profile:profiles(full_name, avatar_url)')
          .eq('product_id', prod.id)
          .eq('is_approved', true)
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('products')
          .select('*, images:product_images(*), category:categories(*)')
          .eq('category_id', prod.category_id)
          .eq('is_active', true)
          .neq('id', prod.id)
          .limit(4),
      ])
      if (revRes.data) setReviews(revRes.data as Review[])
      if (relRes.data) setRelated(relRes.data as Product[])
      setLoading(false)
    })()
  }, [slug, navigate])

  if (loading) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12 animate-pulse">
          <div className="aspect-square bg-muted rounded-sm" />
          <div>
            <div className="h-4 bg-muted rounded w-1/4 mb-3" />
            <div className="h-8 bg-muted rounded w-3/4 mb-4" />
            <div className="h-6 bg-muted rounded w-1/3 mb-8" />
            <div className="h-32 bg-muted rounded mb-8" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) return null

  const images = product.images?.length
    ? product.images.sort((a, b) => a.sort_order - b.sort_order)
    : [{ url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800', alt_text: product.name, id: '1', product_id: product.id, sort_order: 0, is_primary: true }]

  const activeVariant = product.variants?.find((v) => v.id === selectedVariant) ?? null
  const displayPrice = activeVariant
    ? product.price + (activeVariant.price_modifier || 0)
    : (product.sale_price ?? product.price)
  const hasDiscount = product.sale_price !== null && !activeVariant

  const handleAddToCart = () => {
    addItem(product, activeVariant, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setZoomPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }

  return (
    <div className="bg-background">
      {/* Breadcrumb */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-foreground transition-colors">Products</Link>
          {product.category && (
            <>
              <span>/</span>
              <Link to={`/products?category=${product.category.slug}`} className="hover:text-foreground transition-colors">
                {product.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-foreground truncate max-w-[200px]">{product.name}</span>
        </div>
      </div>

      {/* Main product section */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-12 xl:gap-20">
          {/* Image gallery */}
          <div className="flex gap-4">
            {/* Thumbnails */}
            <div className="hidden sm:flex flex-col gap-2 w-16">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(i)}
                  className={cn(
                    'aspect-square overflow-hidden rounded-sm border-2 transition-all',
                    selectedImage === i ? 'border-primary' : 'border-border hover:border-muted-foreground'
                  )}
                >
                  <img src={img.url} alt={img.alt_text} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Main image */}
            <div className="flex-1">
              <div
                className="relative aspect-square overflow-hidden rounded-sm bg-muted cursor-zoom-in"
                onMouseEnter={() => setZoomed(true)}
                onMouseLeave={() => setZoomed(false)}
                onMouseMove={handleMouseMove}
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={selectedImage}
                    src={images[selectedImage]?.url}
                    alt={images[selectedImage]?.alt_text}
                    className="w-full h-full object-cover"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={
                      zoomed
                        ? {
                            transform: 'scale(2)',
                            transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                          }
                        : {}
                    }
                  />
                </AnimatePresence>

                {/* Nav arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      className="absolute left-3 top-1/2 -translate-y-1/2 size-8 flex items-center justify-center bg-background/80 rounded-full hover:bg-background transition-colors"
                      onClick={() => setSelectedImage((prev) => (prev - 1 + images.length) % images.length)}
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <button
                      className="absolute right-3 top-1/2 -translate-y-1/2 size-8 flex items-center justify-center bg-background/80 rounded-full hover:bg-background transition-colors"
                      onClick={() => setSelectedImage((prev) => (prev + 1) % images.length)}
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </>
                )}

                <button className="absolute top-3 right-3 size-8 flex items-center justify-center bg-background/80 rounded-full hover:bg-background transition-colors">
                  <ZoomIn className="size-4" />
                </button>

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  {hasDiscount && (
                    <Badge className="text-xs bg-destructive">
                      Save {Math.round(((product.price - product.sale_price!) / product.price) * 100)}%
                    </Badge>
                  )}
                  {product.is_new_arrival && (
                    <Badge variant="secondary" className="text-xs">New Arrival</Badge>
                  )}
                </div>
              </div>

              {/* Mobile thumbnail dots */}
              <div className="flex gap-2 mt-3 justify-center sm:hidden">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={cn(
                      'h-1 rounded-full transition-all',
                      selectedImage === i ? 'w-6 bg-primary' : 'w-3 bg-border'
                    )}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Product info */}
          <div>
            {/* Category */}
            {product.category && (
              <Link
                to={`/products?category=${product.category.slug}`}
                className="text-xs tracking-[0.3em] uppercase text-muted-foreground hover:text-primary transition-colors"
              >
                {product.category.name}
              </Link>
            )}

            <h1 className="font-serif text-3xl lg:text-4xl font-semibold text-foreground mt-2 mb-4 leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            {product.rating_count > 0 && (
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'size-4',
                        i < Math.round(product.rating_avg)
                          ? 'fill-[var(--gold)] text-[var(--gold)]'
                          : 'text-border fill-border'
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.rating_avg.toFixed(1)} ({product.rating_count} reviews)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-semibold text-foreground">
                Rs. {displayPrice.toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-lg text-muted-foreground line-through">
                  Rs. {product.price.toLocaleString()}
                </span>
              )}
            </div>

            {/* Short description */}
            <p className="text-muted-foreground leading-relaxed mb-6">{product.short_description}</p>

            <Separator className="mb-6" />

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-medium mb-3 tracking-wide">
                  Select Option:
                  {selectedVariant && (
                    <span className="font-normal text-muted-foreground ml-2">
                      {product.variants.find((v) => v.id === selectedVariant)?.name}
                    </span>
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v.id === selectedVariant ? null : v.id)}
                      disabled={v.stock_quantity === 0}
                      className={cn(
                        'px-3 py-1.5 text-sm border rounded-sm transition-all',
                        selectedVariant === v.id
                          ? 'border-primary bg-primary/10 text-primary font-medium'
                          : 'border-border hover:border-primary/60',
                        v.stock_quantity === 0 && 'opacity-40 cursor-not-allowed line-through'
                      )}
                    >
                      {v.name}
                      {v.price_modifier !== 0 && (
                        <span className="text-xs text-muted-foreground ml-1">
                          ({v.price_modifier > 0 ? '+' : ''}Rs. {v.price_modifier.toLocaleString()})
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-6">
              <p className="text-sm font-medium tracking-wide">Quantity:</p>
              <div className="flex items-center border border-border rounded-sm">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9 rounded-none"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="size-3.5" />
                </Button>
                <span className="w-12 text-center text-sm font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9 rounded-none"
                  onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                >
                  <Plus className="size-3.5" />
                </Button>
              </div>
              <span className="text-xs text-muted-foreground">
                {product.stock_quantity > 0
                  ? `${product.stock_quantity} available`
                  : 'Out of stock'}
              </span>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-3 mb-8">
              <Button
                size="lg"
                className={cn('flex-1 gap-2 text-sm tracking-wide transition-all',
                  added && 'bg-green-600 hover:bg-green-600'
                )}
                onClick={handleAddToCart}
                disabled={product.stock_quantity === 0}
              >
                {added ? <Check className="size-4" /> : <ShoppingBag className="size-4" />}
                {added ? 'Added to Cart!' : 'Add to Cart'}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className={cn(
                  'size-12 p-0 shrink-0 transition-colors',
                  has(product.id) && 'border-destructive text-destructive hover:bg-destructive/10'
                )}
                onClick={() => toggle(product.id)}
              >
                <Heart className={cn('size-5', has(product.id) && 'fill-current')} />
              </Button>
              <Button variant="outline" size="lg" className="size-12 p-0 shrink-0">
                <Share2 className="size-5" />
              </Button>
            </div>

            {/* Delivery info */}
            <div className="bg-muted/50 rounded-sm p-4 flex flex-col gap-3 text-sm">
              {[
                { icon: Truck, label: 'Free delivery on orders over Rs. 5,000' },
                { icon: RotateCcw, label: '30-day hassle-free returns' },
                { icon: Shield, label: '5-year quality guarantee' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3 text-muted-foreground">
                  <Icon className="size-4 shrink-0 text-primary" />
                  <span>{label}</span>
                </div>
              ))}
            </div>

            {/* SKU / Tags */}
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
              {product.sku && <span>SKU: {product.sku}</span>}
              {product.tags?.length > 0 && (
                <span>Tags: {product.tags.join(', ')}</span>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="description">
            <TabsList className="w-full justify-start border-b border-border rounded-none bg-transparent h-auto p-0 gap-0">
              {['description', 'reviews', 'shipping'].map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent pb-3 px-6 capitalize text-sm tracking-wide"
                >
                  {tab === 'reviews' ? `Reviews (${product.rating_count})` : tab}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="description" className="mt-8 max-w-2xl">
              <div className="prose prose-sm text-muted-foreground leading-relaxed">
                <p className="whitespace-pre-wrap">{product.description}</p>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-8">
              {reviews.length === 0 ? (
                <p className="text-muted-foreground text-sm">No reviews yet.</p>
              ) : (
                <div className="flex flex-col gap-6 max-w-2xl">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-border pb-6">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">
                            {(review.profile as { full_name?: string })?.full_name?.[0]?.toUpperCase() ?? 'U'}
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {(review.profile as { full_name?: string })?.full_name ?? 'Customer'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(review.created_at).toLocaleDateString('en-PK', { dateStyle: 'medium' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={cn('size-3.5', i < review.rating ? 'fill-[var(--gold)] text-[var(--gold)]' : 'text-border fill-border')}
                            />
                          ))}
                        </div>
                      </div>
                      {review.title && <p className="font-medium text-sm mb-1">{review.title}</p>}
                      <p className="text-sm text-muted-foreground leading-relaxed">{review.body}</p>
                      {review.is_verified_purchase && (
                        <Badge variant="secondary" className="mt-2 text-[10px]">
                          <Check className="size-2.5 mr-1" /> Verified Purchase
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="shipping" className="mt-8 max-w-2xl">
              <div className="grid sm:grid-cols-2 gap-6">
                {[
                  { title: 'Standard Delivery', desc: 'Lahore & Karachi: 2–3 business days\nOther cities: 3–5 business days\nFree on orders over Rs. 5,000\nRs. 350 for smaller orders' },
                  { title: 'Express Delivery', desc: 'Lahore: Next day delivery\nKarachi: 1–2 business days\nRs. 650 surcharge applies' },
                  { title: 'White Glove Service', desc: 'Available for large furniture\nProfessional installation included\nSchedule at your convenience\nContact us to arrange' },
                  { title: 'Returns', desc: '30-day return window\nItems must be unused\nOriginal packaging required\nFull refund processed in 5 days' },
                ].map(({ title, desc }) => (
                  <div key={title} className="bg-muted/50 p-5 rounded-sm">
                    <h4 className="font-medium mb-2">{title}</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-20">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-xs tracking-[0.4em] uppercase text-muted-foreground mb-2">
                  You May Also Like
                </p>
                <h2 className="font-serif text-3xl font-semibold">Related Products</h2>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
