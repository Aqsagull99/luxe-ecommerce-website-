import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, ShoppingBag, Star, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useCartStore } from '@/store/useCartStore'
import { useWishlistStore } from '@/store/useWishlistStore'
import type { Product } from '@/lib/supabase'

type Props = {
  product: Product
  className?: string
  layout?: 'grid' | 'list'
}

export function ProductCard({ product, className, layout = 'grid' }: Props) {
  const [hovered, setHovered] = useState(false)
  const [added, setAdded] = useState(false)
  const navigate = useNavigate()
  const addItem = useCartStore((s) => s.addItem)
  const { toggle, has } = useWishlistStore()
  const inWishlist = has(product.id)

  const primaryImage = product.images?.[0]?.url ?? `https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600`
  const secondaryImage = product.images?.[1]?.url ?? primaryImage
  const displayPrice = product.sale_price ?? product.price
  const hasDiscount = product.sale_price !== null && product.sale_price < product.price
  const discountPct = hasDiscount
    ? Math.round(((product.price - product.sale_price!) / product.price) * 100)
    : 0

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggle(product.id)
  }

  if (layout === 'list') {
    return (
      <Link to={`/products/${product.slug}`} className={cn('group', className)}>
        <div className="flex gap-5 p-4 rounded-sm border border-border hover:border-primary/40 transition-all duration-300 hover:shadow-md bg-card">
          <div className="relative w-32 h-32 sm:w-44 sm:h-44 shrink-0 overflow-hidden rounded-sm bg-muted">
            <img
              src={primaryImage}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {hasDiscount && (
              <Badge className="absolute top-2 left-2 text-[10px] bg-destructive">
                -{discountPct}%
              </Badge>
            )}
          </div>
          <div className="flex-1 min-w-0 py-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs text-muted-foreground tracking-wider uppercase mb-1">
                  {product.category?.name}
                </p>
                <h3 className="font-serif text-lg font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {product.name}
                </h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className={cn('size-8 shrink-0', inWishlist && 'text-destructive')}
                onClick={handleWishlist}
              >
                <Heart className={cn('size-4', inWishlist && 'fill-current')} />
              </Button>
            </div>
            <div className="flex items-center gap-1 mt-2 mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'size-3',
                    i < Math.round(product.rating_avg)
                      ? 'fill-[var(--gold)] text-[var(--gold)]'
                      : 'text-border fill-border'
                  )}
                />
              ))}
              <span className="text-xs text-muted-foreground ml-1">({product.rating_count})</span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {product.short_description}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-semibold text-foreground">
                  Rs. {displayPrice.toLocaleString()}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-muted-foreground line-through">
                    Rs. {product.price.toLocaleString()}
                  </span>
                )}
              </div>
              <Button
                size="sm"
                onClick={handleAddToCart}
                className={cn('gap-2 transition-all', added && 'bg-green-600 hover:bg-green-600')}
              >
                <ShoppingBag className="size-4" />
                {added ? 'Added!' : 'Add to Cart'}
              </Button>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <motion.div
      className={cn('group relative', className)}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <Link to={`/products/${product.slug}`} className="block">
        {/* Image container */}
        <div className="relative overflow-hidden bg-muted aspect-[3/4] rounded-sm mb-3">
          {/* Primary image */}
          <img
            src={primaryImage}
            alt={product.name}
            className={cn(
              'absolute inset-0 w-full h-full object-cover transition-all duration-700',
              hovered ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
            )}
          />
          {/* Secondary image on hover */}
          <img
            src={secondaryImage}
            alt={product.name}
            className={cn(
              'absolute inset-0 w-full h-full object-cover transition-all duration-700',
              hovered ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            )}
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {hasDiscount && (
              <Badge className="text-[10px] py-0.5 bg-destructive">
                Save {discountPct}%
              </Badge>
            )}
            {product.is_new_arrival && !hasDiscount && (
              <Badge variant="secondary" className="text-[10px] py-0.5">
                New
              </Badge>
            )}
            {product.is_best_seller && (
              <Badge className="text-[10px] py-0.5 bg-[var(--gold)] text-[var(--gold-foreground)]">
                Best Seller
              </Badge>
            )}
          </div>

          {/* Actions overlay */}
          <motion.div
            className="absolute top-3 right-3 flex flex-col gap-2"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : 10 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              variant="secondary"
              size="icon"
              className={cn(
                'size-8 shadow-md',
                inWishlist && 'text-destructive bg-destructive/10 hover:bg-destructive/20'
              )}
              onClick={handleWishlist}
            >
              <Heart className={cn('size-3.5', inWishlist && 'fill-current')} />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="size-8 shadow-md"
              onClick={() => navigate(`/products/${product.slug}`)}
            >
              <Eye className="size-3.5" />
            </Button>
          </motion.div>

          {/* Low stock indicator */}
          {product.stock_quantity <= product.low_stock_threshold && product.stock_quantity > 0 && (
            <div className="absolute bottom-0 left-0 right-0 bg-amber-500/90 text-white text-[10px] text-center py-1 tracking-wider">
              Only {product.stock_quantity} left
            </div>
          )}
          {product.stock_quantity === 0 && (
            <div className="absolute bottom-0 left-0 right-0 bg-foreground/80 text-background text-[10px] text-center py-1 tracking-wider">
              Out of Stock
            </div>
          )}
        </div>

        {/* Info */}
        <div className="px-0.5">
          <p className="text-[10px] text-muted-foreground tracking-[0.15em] uppercase mb-1">
            {product.category?.name}
          </p>
          <h3 className="font-serif text-base font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-1.5">
            {product.name}
          </h3>

          {/* Rating */}
          {product.rating_count > 0 && (
            <div className="flex items-center gap-1 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'size-2.5',
                    i < Math.round(product.rating_avg)
                      ? 'fill-[var(--gold)] text-[var(--gold)]'
                      : 'text-border fill-border'
                  )}
                />
              ))}
              <span className="text-[10px] text-muted-foreground ml-0.5">
                ({product.rating_count})
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-base font-semibold text-foreground">
                Rs. {displayPrice.toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-xs text-muted-foreground line-through">
                  Rs. {product.price.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>

      {/* Add to cart button (shows on hover) */}
      <motion.div
        className="mt-2.5"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 6 }}
        transition={{ duration: 0.2 }}
      >
        <Button
          size="sm"
          className={cn('w-full gap-2 text-xs transition-all', added && 'bg-green-600 hover:bg-green-600')}
          onClick={handleAddToCart}
          disabled={product.stock_quantity === 0}
        >
          <ShoppingBag className="size-3.5" />
          {added ? 'Added to Cart!' : product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </motion.div>
    </motion.div>
  )
}
