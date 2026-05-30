import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { SEO } from '@/components/SEO'
import { motion } from 'framer-motion'
import { CheckCircle2, Package, Truck, MapPin, Clock, ArrowRight, Download, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { supabase, type Order } from '@/lib/supabase'
import { useCartStore } from '@/store/useCartStore'

const paymentLabels: Record<string, string> = {
  easypaisa: 'EasyPaisa',
  jazzcash: 'JazzCash',
  bank_transfer: 'Bank Transfer',
  cod: 'Cash on Delivery',
}

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  processing: { label: 'Processing', color: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  shipped: { label: 'Shipped', color: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/30' },
  delivered: { label: 'Delivered', color: 'bg-green-500/10 text-green-600 border-green-500/30' },
  cancelled: { label: 'Cancelled', color: 'bg-destructive/10 text-destructive border-destructive/30' },
}

export function OrderConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const clearCart = useCartStore((s) => s.clearCart)

  useEffect(() => {
    clearCart()
    if (!orderId) { setLoading(false); return }
    void fetchOrder()
  }, [orderId])

  const fetchOrder = async () => {
    const { data } = await supabase
      .from('orders')
      .select(`*, items:order_items(*)`)
      .eq('id', orderId)
      .maybeSingle()
    setOrder(data as Order)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin size-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="font-serif text-3xl font-semibold mb-3">Order Not Found</h2>
        <p className="text-muted-foreground mb-6">We couldn't find this order. Please check your account for details.</p>
        <Button asChild><Link to="/account/orders">View My Orders</Link></Button>
      </div>
    )
  }

  const steps = [
    { label: 'Order Placed', icon: CheckCircle2, done: true },
    { label: 'Processing', icon: Package, done: ['processing', 'shipped', 'delivered'].includes(order.status) },
    { label: 'Shipped', icon: Truck, done: ['shipped', 'delivered'].includes(order.status) },
    { label: 'Delivered', icon: MapPin, done: order.status === 'delivered' },
  ]

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Order Confirmed" description="Your order has been placed successfully. Thank you for shopping at Maison Luxe." />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            className="inline-flex size-20 items-center justify-center rounded-full bg-green-500/10 mb-5"
          >
            <CheckCircle2 className="size-10 text-green-600" />
          </motion.div>
          <h1 className="font-serif text-4xl font-semibold mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Thank you for your purchase. We'll send you a confirmation shortly.
          </p>
          <div className="flex items-center justify-center gap-3 mt-4">
            <span className="text-sm text-muted-foreground">Order #</span>
            <span className="font-mono font-semibold text-foreground text-sm tracking-wider">
              {order.order_number}
            </span>
            <Badge className={`text-xs border ${statusConfig[order.status]?.color ?? ''}`} variant="outline">
              {statusConfig[order.status]?.label ?? order.status}
            </Badge>
          </div>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-sm p-6 mb-6"
        >
          <h2 className="font-serif text-lg font-semibold mb-6">Order Status</h2>
          <div className="relative flex justify-between">
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-border">
              <div
                className="h-full bg-primary transition-all duration-700"
                style={{ width: `${(steps.filter((s) => s.done).length - 1) * (100 / (steps.length - 1))}%` }}
              />
            </div>
            {steps.map((step) => (
              <div key={step.label} className="flex flex-col items-center gap-2 z-10">
                <div className={`size-10 rounded-full flex items-center justify-center border-2 bg-background transition-colors ${step.done ? 'border-primary bg-primary' : 'border-border'}`}>
                  <step.icon className={`size-4 ${step.done ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                </div>
                <span className={`text-[11px] font-medium text-center max-w-14 leading-tight ${step.done ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
          {order.estimated_delivery && (
            <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="size-4" />
              <span>Estimated delivery: <strong className="text-foreground">{order.estimated_delivery}</strong></span>
            </div>
          )}
        </motion.div>

        {/* Order Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-sm p-6 mb-6"
        >
          <h2 className="font-serif text-lg font-semibold mb-4">Items Ordered</h2>
          <div className="flex flex-col gap-4">
            {order.items?.map((item) => (
              <div key={item.id} className="flex gap-4">
                <div className="size-16 rounded-sm overflow-hidden bg-muted shrink-0">
                  <img
                    src={item.image_url || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200'}
                    alt={item.product_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm line-clamp-1">{item.product_name}</p>
                  {item.variant_name && <p className="text-xs text-muted-foreground">{item.variant_name}</p>}
                  <p className="text-xs text-muted-foreground mt-0.5">Qty: {item.quantity}</p>
                </div>
                <p className="font-semibold text-sm shrink-0">
                  Rs. {item.total_price.toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>Rs. {order.subtotal.toLocaleString()}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-green-600 dark:text-green-400">
                <span>Discount</span>
                <span>-Rs. {order.discount_amount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span>
              <span className={order.shipping_amount === 0 ? 'text-green-600 dark:text-green-400' : ''}>
                {order.shipping_amount === 0 ? 'Free' : `Rs. ${order.shipping_amount.toLocaleString()}`}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-base">
              <span>Total</span>
              <span>Rs. {order.total_amount.toLocaleString()}</span>
            </div>
          </div>
        </motion.div>

        {/* Delivery & Payment Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid sm:grid-cols-2 gap-4 mb-8"
        >
          <div className="bg-card border border-border rounded-sm p-5">
            <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
              <MapPin className="size-4 text-muted-foreground" /> Shipping Address
            </h3>
            {order.shipping_address && (
              <div className="text-sm text-muted-foreground leading-relaxed">
                <p className="font-medium text-foreground">{order.shipping_address.full_name}</p>
                <p>{order.shipping_address.address_line1}</p>
                {order.shipping_address.address_line2 && <p>{order.shipping_address.address_line2}</p>}
                <p>{order.shipping_address.city}, {order.shipping_address.state}</p>
                <p>{order.shipping_address.phone}</p>
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-sm p-5">
            <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
              <Package className="size-4 text-muted-foreground" /> Payment Details
            </h3>
            <div className="text-sm text-muted-foreground leading-relaxed">
              <p className="font-medium text-foreground">{paymentLabels[order.payment_method]}</p>
              <p className="mt-1">
                Status:{' '}
                <span className={order.payment_status === 'paid' ? 'text-green-600' : 'text-amber-600'}>
                  {order.payment_status === 'paid' ? 'Paid' : 'Pending Verification'}
                </span>
              </p>
              {order.payment_method === 'cod' && (
                <p className="mt-1 text-xs">Payment due on delivery.</p>
              )}
              {(order.payment_method === 'easypaisa' || order.payment_method === 'jazzcash' || order.payment_method === 'bank_transfer') && (
                <p className="mt-1 text-xs">Our team will verify your payment within 24 hours.</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <Button size="lg" className="flex-1 gap-2" asChild>
            <Link to="/account/orders">
              View All Orders <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="gap-2">
            <Download className="size-4" /> Download Invoice
          </Button>
          <Button variant="outline" size="lg" className="gap-2">
            <Share2 className="size-4" /> Share
          </Button>
        </motion.div>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Have questions?{' '}
            <Link to="/contact" className="text-primary hover:underline">Contact our support team</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
