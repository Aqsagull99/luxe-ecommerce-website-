import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { SEO } from '@/components/SEO'
import { motion, AnimatePresence } from 'framer-motion'
import { Minus, Plus, Trash2, ShoppingBag, Tag, ArrowRight, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useCartStore } from '@/store/useCartStore'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

export function CartPage() {
  const {
    items, removeItem, updateQty, getSubtotal, getDiscount, getShipping, getTotal,
    couponCode, applyCoupon, removeCoupon
  } = useCartStore()
  const navigate = useNavigate()
  const [couponInput, setCouponInput] = useState('')
  const [couponError, setCouponError] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [_couponApplied, setCouponApplied] = useState(false)

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return
    setCouponLoading(true)
    setCouponError('')
    const { data } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', couponInput.trim().toUpperCase())
      .eq('is_active', true)
      .maybeSingle()

    if (!data) {
      setCouponError('Invalid or expired coupon code.')
    } else if (data.expires_at && new Date(data.expires_at) < new Date()) {
      setCouponError('This coupon has expired.')
    } else if (getSubtotal() < data.min_order_amount) {
      setCouponError(`Minimum order amount of Rs. ${data.min_order_amount.toLocaleString()} required.`)
    } else {
      applyCoupon(data.code, data.value, data.type as 'percentage' | 'fixed' | 'free_shipping')
      setCouponApplied(true)
      setCouponInput('')
    }
    setCouponLoading(false)
  }

  const subtotal = getSubtotal()
  const discount = getDiscount()
  const shipping = getShipping()
  const total = getTotal()

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-20 text-center">
        <div className="size-24 rounded-full bg-muted flex items-center justify-center mb-6">
          <ShoppingBag className="size-10 text-muted-foreground" />
        </div>
        <h2 className="font-serif text-3xl font-semibold mb-3">Your Cart is Empty</h2>
        <p className="text-muted-foreground max-w-sm mb-8 leading-relaxed">
          Discover our curated collection of premium home decor and fill your cart with pieces
          that speak to your style.
        </p>
        <Button size="lg" className="gap-2 tracking-wide px-10" asChild>
          <Link to="/products">
            Start Shopping <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Shopping Cart" description="Review your items and proceed to checkout at Maison Luxe." />
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-semibold">Shopping Cart</h1>
          <p className="text-muted-foreground mt-1 text-sm">{items.length} item{items.length !== 1 ? 's' : ''}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -40, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex gap-5 py-5 border-b border-border"
                >
                  {/* Image */}
                  <Link to={`/products/${item.slug}`} className="shrink-0">
                    <div className="size-28 sm:size-36 rounded-sm overflow-hidden bg-muted">
                      <img
                        src={item.imageUrl || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400'}
                        alt={item.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link
                          to={`/products/${item.slug}`}
                          className="font-serif text-lg font-medium text-foreground hover:text-primary transition-colors line-clamp-2"
                        >
                          {item.name}
                        </Link>
                        {item.variantName && (
                          <p className="text-xs text-muted-foreground mt-0.5">{item.variantName}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>

                    <div className="mt-3 flex items-center justify-between flex-wrap gap-3">
                      {/* Quantity */}
                      <div className="flex items-center border border-border rounded-sm">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 rounded-none"
                          onClick={() => updateQty(item.id, item.quantity - 1)}
                        >
                          <Minus className="size-3" />
                        </Button>
                        <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 rounded-none"
                          onClick={() => updateQty(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stockQty}
                        >
                          <Plus className="size-3" />
                        </Button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="font-semibold text-foreground">
                          Rs. {(item.price * item.quantity).toLocaleString()}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-xs text-muted-foreground">
                            Rs. {item.price.toLocaleString()} each
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Continue shopping */}
            <div className="pt-5">
              <Button variant="outline" className="gap-2" asChild>
                <Link to="/products">
                  <ArrowRight className="size-4 rotate-180" />
                  Continue Shopping
                </Link>
              </Button>
            </div>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-sm p-6 sticky top-24">
              <h2 className="font-serif text-xl font-semibold mb-6">Order Summary</h2>

              {/* Coupon */}
              <div className="mb-5">
                <p className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Tag className="size-3.5" /> Promo Code
                </p>
                {couponCode ? (
                  <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-sm px-3 py-2">
                    <Check className="size-4 text-green-600 shrink-0" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-400 flex-1">
                      {couponCode} applied!
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6 text-muted-foreground hover:text-destructive"
                      onClick={() => { removeCoupon(); setCouponApplied(false) }}
                    >
                      <X className="size-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter code"
                      value={couponInput}
                      onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError('') }}
                      className="flex-1 h-8 text-sm uppercase"
                      onKeyDown={(e) => e.key === 'Enter' && void handleApplyCoupon()}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => void handleApplyCoupon()}
                      disabled={couponLoading}
                    >
                      {couponLoading ? '...' : 'Apply'}
                    </Button>
                  </div>
                )}
                {couponError && <p className="text-xs text-destructive mt-1.5">{couponError}</p>}
                <p className="text-xs text-muted-foreground mt-1.5">
                  Try: WELCOME10, LUXURY20, FLAT500, FREESHIP
                </p>
              </div>

              <Separator className="mb-5" />

              {/* Price breakdown */}
              <div className="flex flex-col gap-3 text-sm mb-5">
                <div className="flex justify-between text-foreground/80">
                  <span>Subtotal</span>
                  <span>Rs. {subtotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Discount ({couponCode})</span>
                    <span>-Rs. {discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-foreground/80">
                  <span>Shipping</span>
                  <span className={cn(shipping === 0 ? 'text-green-600 dark:text-green-400' : '')}>
                    {shipping === 0 ? 'Free' : `Rs. ${shipping.toLocaleString()}`}
                  </span>
                </div>
              </div>

              <Separator className="mb-4" />

              <div className="flex justify-between font-semibold text-lg mb-6">
                <span>Total</span>
                <span>Rs. {total.toLocaleString()}</span>
              </div>

              <Button
                size="lg"
                className="w-full gap-2 tracking-wide text-sm mb-3"
                onClick={() => navigate('/checkout')}
              >
                Proceed to Checkout <ArrowRight className="size-4" />
              </Button>

              <div className="text-center mt-4">
                <p className="text-[11px] text-muted-foreground">
                  Secure checkout · SSL encrypted
                </p>
                <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
                  {['EasyPaisa', 'JazzCash', 'Bank Transfer'].map((m) => (
                    <Badge key={m} variant="outline" className="text-[10px] py-0">{m}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
