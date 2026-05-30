import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SEO } from '@/components/SEO'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronRight, Upload, CreditCard, Building2, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useCartStore } from '@/store/useCartStore'
import { useAuthStore } from '@/store/useAuthStore'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

type Step = 'address' | 'shipping' | 'payment' | 'review'

const steps: { key: Step; label: string }[] = [
  { key: 'address', label: 'Address' },
  { key: 'shipping', label: 'Shipping' },
  { key: 'payment', label: 'Payment' },
  { key: 'review', label: 'Review' },
]

const paymentMethods = [
  { id: 'easypaisa', label: 'EasyPaisa', icon: Smartphone, desc: 'Pay via EasyPaisa mobile wallet', color: 'bg-green-500' },
  { id: 'jazzcash', label: 'JazzCash', icon: Smartphone, desc: 'Pay via JazzCash mobile account', color: 'bg-red-500' },
  { id: 'bank_transfer', label: 'Bank Transfer', icon: Building2, desc: 'Direct bank transfer — upload proof', color: 'bg-blue-600' },
  { id: 'cod', label: 'Cash on Delivery', icon: CreditCard, desc: 'Pay when your order arrives', color: 'bg-amber-500' },
]

const bankDetails = [
  { bank: 'HBL', accountTitle: 'Maison Luxe Pvt Ltd', accountNo: '1234-5678-9012', iban: 'PK12HABB0012345678901234' },
  { bank: 'UBL', accountTitle: 'Maison Luxe Pvt Ltd', accountNo: '4321-8765-2109', iban: 'PK34UNIL0012432187652109' },
]

export function CheckoutPage() {
  const navigate = useNavigate()
  const { items, getSubtotal, getDiscount, getShipping, couponCode, clearCart } = useCartStore()
  const { user } = useAuthStore()
  const [currentStep, setCurrentStep] = useState<Step>('address')
  const [loading, setLoading] = useState(false)

  const [address, setAddress] = useState({
    full_name: '', phone: '', address_line1: '', address_line2: '',
    city: '', state: '', postal_code: '', country: 'Pakistan',
  })
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard')
  const [paymentMethod, setPaymentMethod] = useState<string>('bank_transfer')
  const [transactionRef, setTransactionRef] = useState('')
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [mobileNumber, setMobileNumber] = useState('')

  const subtotal = getSubtotal()
  const discount = getDiscount()
  const baseShipping = getShipping()
  const expressExtra = shippingMethod === 'express' ? 300 : 0
  const shipping = baseShipping + expressExtra
  const total = subtotal - discount + shipping

  const goNext = () => {
    const idx = steps.findIndex((s) => s.key === currentStep)
    if (idx < steps.length - 1) setCurrentStep(steps[idx + 1].key)
  }

  const goBack = () => {
    const idx = steps.findIndex((s) => s.key === currentStep)
    if (idx > 0) setCurrentStep(steps[idx - 1].key)
  }

  const placeOrder = async () => {
    if (!user) { navigate('/auth'); return }
    setLoading(true)

    const orderNumber = `ML-${Date.now().toString().slice(-8)}`
    const estimatedDelivery = new Date()
    estimatedDelivery.setDate(estimatedDelivery.getDate() + (shippingMethod === 'express' ? 2 : 5))

    // Upload proof file if bank transfer
    let proofUrl = ''
    if (paymentMethod === 'bank_transfer' && proofFile) {
      const fileExt = proofFile.name.split('.').pop()
      const fileName = `payment-proofs/${orderNumber}-${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, proofFile)

      if (uploadError) {
        toast.error('Failed to upload payment proof. Please try again.')
        setLoading(false)
        return
      }
      const { data: { publicUrl } } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(fileName)
      proofUrl = publicUrl
    }

    const { data: order, error } = await supabase.from('orders').insert({
      order_number: orderNumber,
      user_id: user.id,
      status: 'pending',
      subtotal,
      discount_amount: discount,
      shipping_amount: shipping,
      tax_amount: 0,
      total_amount: total,
      coupon_code: couponCode,
      shipping_address: address,
      billing_address: address,
      payment_method: paymentMethod,
      payment_status: 'pending',
      estimated_delivery: estimatedDelivery.toISOString(),
      notes: paymentMethod === 'bank_transfer' && proofUrl ? `Payment proof: ${proofUrl}` : '',
    }).select().single()

    if (error || !order) { setLoading(false); return }

    await supabase.from('order_items').insert(
      items.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        variant_id: item.variantId,
        product_name: item.name,
        variant_name: item.variantName,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
        image_url: item.imageUrl,
      }))
    )

    await supabase.from('payment_transactions').insert({
      order_id: order.id,
      user_id: user.id,
      method: paymentMethod,
      amount: total,
      status: 'pending',
      transaction_ref: transactionRef,
      proof_url: proofUrl || null,
    })

    clearCart()
    setLoading(false)
    navigate(`/order-confirmation/${order.id}`)
  }

  const stepIndex = steps.findIndex((s) => s.key === currentStep)

  return (
    <div className="min-h-screen bg-background py-10">
      <SEO title="Checkout" description="Complete your order at Maison Luxe. Secure checkout with multiple payment options." />
      <div className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-3xl font-semibold mb-8">Checkout</h1>

        {/* Step indicators */}
        <div className="flex items-center mb-10">
          {steps.map((step, i) => (
            <div key={step.key} className="flex items-center flex-1 last:flex-none">
              <div
                className={cn(
                  'flex items-center gap-2 cursor-pointer',
                  i <= stepIndex ? 'text-foreground' : 'text-muted-foreground'
                )}
                onClick={() => i < stepIndex && setCurrentStep(step.key)}
              >
                <div
                  className={cn(
                    'size-7 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all',
                    i < stepIndex
                      ? 'bg-primary border-primary text-primary-foreground'
                      : i === stepIndex
                      ? 'border-primary text-primary'
                      : 'border-border text-muted-foreground'
                  )}
                >
                  {i < stepIndex ? <Check className="size-3.5" /> : i + 1}
                </div>
                <span className="text-sm font-medium hidden sm:block tracking-wide">{step.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={cn('flex-1 h-px mx-3', i < stepIndex ? 'bg-primary' : 'bg-border')} />
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Step content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                {/* STEP 1: Address */}
                {currentStep === 'address' && (
                  <div className="bg-card border border-border rounded-sm p-6">
                    <h2 className="font-serif text-xl font-semibold mb-6">Delivery Address</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <Label className="text-sm mb-1.5 block">Full Name *</Label>
                        <Input value={address.full_name} onChange={(e) => setAddress({ ...address, full_name: e.target.value })} placeholder="e.g. Ali Hassan" />
                      </div>
                      <div>
                        <Label className="text-sm mb-1.5 block">Phone Number *</Label>
                        <Input value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} placeholder="+92 300 000 0000" />
                      </div>
                      <div>
                        <Label className="text-sm mb-1.5 block">City *</Label>
                        <Input value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} placeholder="Lahore" />
                      </div>
                      <div className="sm:col-span-2">
                        <Label className="text-sm mb-1.5 block">Address Line 1 *</Label>
                        <Input value={address.address_line1} onChange={(e) => setAddress({ ...address, address_line1: e.target.value })} placeholder="House No., Street, Area" />
                      </div>
                      <div className="sm:col-span-2">
                        <Label className="text-sm mb-1.5 block">Address Line 2 <span className="text-muted-foreground">(optional)</span></Label>
                        <Input value={address.address_line2} onChange={(e) => setAddress({ ...address, address_line2: e.target.value })} placeholder="Landmark, Block, etc." />
                      </div>
                      <div>
                        <Label className="text-sm mb-1.5 block">Province</Label>
                        <Input value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} placeholder="Punjab" />
                      </div>
                      <div>
                        <Label className="text-sm mb-1.5 block">Postal Code</Label>
                        <Input value={address.postal_code} onChange={(e) => setAddress({ ...address, postal_code: e.target.value })} placeholder="54000" />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: Shipping */}
                {currentStep === 'shipping' && (
                  <div className="bg-card border border-border rounded-sm p-6">
                    <h2 className="font-serif text-xl font-semibold mb-6">Shipping Method</h2>
                    <div className="flex flex-col gap-3">
                      {[
                        { id: 'standard', label: 'Standard Delivery', desc: '3–5 business days', price: baseShipping },
                        { id: 'express', label: 'Express Delivery', desc: '1–2 business days', price: baseShipping + 300 },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setShippingMethod(opt.id as 'standard' | 'express')}
                          className={cn(
                            'flex items-center justify-between p-4 border rounded-sm text-left transition-all',
                            shippingMethod === opt.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/40'
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn('size-4 rounded-full border-2 flex items-center justify-center', shippingMethod === opt.id ? 'border-primary' : 'border-border')}>
                              {shippingMethod === opt.id && <div className="size-2 rounded-full bg-primary" />}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{opt.label}</p>
                              <p className="text-xs text-muted-foreground">{opt.desc}</p>
                            </div>
                          </div>
                          <span className="font-medium text-sm">
                            {opt.price === 0 ? 'Free' : `Rs. ${opt.price.toLocaleString()}`}
                          </span>
                        </button>
                      ))}
                    </div>
                    <div className="mt-4 p-3 bg-muted/50 rounded-sm text-xs text-muted-foreground">
                      Delivery to: {address.address_line1}, {address.city}, {address.country}
                    </div>
                  </div>
                )}

                {/* STEP 3: Payment */}
                {currentStep === 'payment' && (
                  <div className="bg-card border border-border rounded-sm p-6">
                    <h2 className="font-serif text-xl font-semibold mb-6">Payment Method</h2>
                    <div className="flex flex-col gap-3 mb-6">
                      {paymentMethods.map((pm) => (
                        <button
                          key={pm.id}
                          onClick={() => setPaymentMethod(pm.id)}
                          className={cn(
                            'flex items-center gap-3 p-4 border rounded-sm text-left transition-all',
                            paymentMethod === pm.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                          )}
                        >
                          <div className={cn('size-4 rounded-full border-2 flex items-center justify-center shrink-0', paymentMethod === pm.id ? 'border-primary' : 'border-border')}>
                            {paymentMethod === pm.id && <div className="size-2 rounded-full bg-primary" />}
                          </div>
                          <div className={cn('size-8 rounded flex items-center justify-center shrink-0', pm.color)}>
                            <pm.icon className="size-4 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{pm.label}</p>
                            <p className="text-xs text-muted-foreground">{pm.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Payment details */}
                    {(paymentMethod === 'easypaisa' || paymentMethod === 'jazzcash') && (
                      <div className="border border-border rounded-sm p-4 mt-4">
                        <p className="text-sm font-medium mb-3">
                          {paymentMethod === 'easypaisa' ? 'EasyPaisa' : 'JazzCash'} Details
                        </p>
                        <p className="text-sm text-muted-foreground mb-3">
                          Send Rs. {total.toLocaleString()} to:
                        </p>
                        <div className="bg-muted/50 rounded p-3 text-sm font-mono mb-3">
                          <p className="font-semibold text-foreground">0300 1234567</p>
                          <p className="text-xs text-muted-foreground">Account Title: Maison Luxe</p>
                        </div>
                        <Label className="text-sm mb-1.5 block">Transaction ID / Reference *</Label>
                        <Input value={transactionRef} onChange={(e) => setTransactionRef(e.target.value)} placeholder="Enter transaction ID after payment" />
                        <Label className="text-sm mb-1.5 block mt-3">Your Mobile Number *</Label>
                        <Input value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} placeholder="+92 300 000 0000" />
                      </div>
                    )}

                    {paymentMethod === 'bank_transfer' && (
                      <div className="border border-border rounded-sm p-4 mt-4">
                        <p className="text-sm font-medium mb-3">Bank Account Details</p>
                        <div className="flex flex-col gap-3 mb-4">
                          {bankDetails.map((b) => (
                            <div key={b.bank} className="bg-muted/50 rounded p-3 text-sm">
                              <p className="font-semibold">{b.bank}</p>
                              <p className="text-muted-foreground text-xs">A/C: {b.accountNo}</p>
                              <p className="text-muted-foreground text-xs">IBAN: {b.iban}</p>
                              <p className="text-muted-foreground text-xs">Title: {b.accountTitle}</p>
                            </div>
                          ))}
                        </div>
                        <Label className="text-sm mb-1.5 block">Transaction Reference *</Label>
                        <Input value={transactionRef} onChange={(e) => setTransactionRef(e.target.value)} placeholder="Bank transaction reference number" className="mb-3" />
                        <Label className="text-sm mb-1.5 block">Upload Payment Proof</Label>
                        <div className="border-2 border-dashed border-border rounded-sm p-4 text-center cursor-pointer hover:border-primary/40 transition-colors relative">
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={(e) => setProofFile(e.target.files?.[0] ?? null)}
                          />
                          <Upload className="size-6 text-muted-foreground mx-auto mb-2" />
                          <p className="text-xs text-muted-foreground">
                            {proofFile ? proofFile.name : 'Click to upload screenshot or PDF'}
                          </p>
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'cod' && (
                      <div className="border border-border rounded-sm p-4 mt-4 bg-amber-50 dark:bg-amber-500/10">
                        <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">
                          Cash on Delivery selected
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Please have Rs. {total.toLocaleString()} ready when your order arrives.
                          COD is available in major cities only.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 4: Review */}
                {currentStep === 'review' && (
                  <div className="bg-card border border-border rounded-sm p-6">
                    <h2 className="font-serif text-xl font-semibold mb-6">Review Your Order</h2>

                    <div className="space-y-5">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Delivery Address</p>
                        <p className="text-sm">{address.full_name} · {address.phone}</p>
                        <p className="text-sm text-muted-foreground">{address.address_line1}, {address.city}, {address.country}</p>
                      </div>
                      <Separator />
                      <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Payment</p>
                        <p className="text-sm capitalize">{paymentMethod.replace('_', ' ')}</p>
                        {transactionRef && <p className="text-xs text-muted-foreground">Ref: {transactionRef}</p>}
                      </div>
                      <Separator />
                      <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Items ({items.length})</p>
                        <div className="flex flex-col gap-3">
                          {items.map((item) => (
                            <div key={item.id} className="flex items-center gap-3">
                              <div className="size-14 rounded-sm overflow-hidden bg-muted shrink-0">
                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                                {item.variantName && <p className="text-xs text-muted-foreground">{item.variantName}</p>}
                                <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                              </div>
                              <span className="text-sm font-medium shrink-0">
                                Rs. {(item.price * item.quantity).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation buttons */}
                <div className="flex items-center justify-between mt-5">
                  {stepIndex > 0 ? (
                    <Button variant="outline" onClick={goBack}>Back</Button>
                  ) : <div />}

                  {currentStep !== 'review' ? (
                    <Button className="gap-2" onClick={goNext}>
                      Continue <ChevronRight className="size-4" />
                    </Button>
                  ) : (
                    <Button
                      className="gap-2 px-8"
                      onClick={() => void placeOrder()}
                      disabled={loading}
                    >
                      {loading ? 'Placing Order...' : 'Place Order'}
                      {!loading && <Check className="size-4" />}
                    </Button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Order summary sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-sm p-5 sticky top-24">
              <h3 className="font-semibold mb-4 text-sm tracking-wide uppercase">Order Summary</h3>
              <div className="flex flex-col gap-2 text-sm mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-muted-foreground">
                    <span className="line-clamp-1 flex-1 mr-2">{item.name} × {item.quantity}</span>
                    <span className="shrink-0">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <Separator className="my-3" />
              <div className="flex flex-col gap-1.5 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span><span>Rs. {subtotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Discount</span><span>-Rs. {discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `Rs. ${shipping.toLocaleString()}`}</span>
                </div>
              </div>
              <Separator className="my-3" />
              <div className="flex justify-between font-semibold">
                <span>Total</span><span>Rs. {total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
