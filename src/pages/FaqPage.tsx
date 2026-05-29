import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const faqs = [
  {
    category: 'Orders & Shipping',
    items: [
      { q: 'How long does delivery take?', a: 'Standard delivery takes 3–5 business days within Pakistan. Express delivery (2–3 days) is available at an additional cost. Remote areas may take up to 7 days.' },
      { q: 'What is the shipping cost?', a: 'We offer free standard shipping on orders over Rs. 5,000. For orders below this threshold, a flat shipping fee of Rs. 350 applies.' },
      { q: 'Can I track my order?', a: 'Yes! Once your order is shipped, you\'ll receive a tracking number via email/SMS. You can also track it in your account dashboard under "My Orders".' },
      { q: 'Do you ship internationally?', a: 'Currently we only ship within Pakistan. International shipping is planned for 2025.' },
    ],
  },
  {
    category: 'Payments',
    items: [
      { q: 'What payment methods do you accept?', a: 'We accept EasyPaisa, JazzCash, direct bank transfer, and Cash on Delivery (COD). COD is available in major cities.' },
      { q: 'How does payment verification work?', a: 'For EasyPaisa and JazzCash, send the payment to our displayed account, then enter your transaction ID. Our team verifies within 24 hours. For bank transfers, upload your payment proof.' },
      { q: 'Is COD available everywhere?', a: 'COD is available in Lahore, Karachi, Islamabad, Rawalpindi, and Faisalabad. A Rs. 150 COD handling fee applies.' },
      { q: 'How do I use a coupon code?', a: 'Enter your coupon code in the cart page before proceeding to checkout. Codes: WELCOME10 (10% off), LUXURY20 (20% off), FLAT500 (Rs. 500 off), FREESHIP (free shipping).' },
    ],
  },
  {
    category: 'Returns & Exchanges',
    items: [
      { q: 'What is your return policy?', a: 'We accept returns within 7 days of delivery for items in original, unused condition with all packaging. Some fragile items and custom orders are non-returnable.' },
      { q: 'How do I initiate a return?', a: 'Contact our support team with your order number and photos of the item. We\'ll arrange a pickup. Refunds are processed within 5–7 business days.' },
      { q: 'What if my item arrives damaged?', a: 'We\'re so sorry! Please photograph the damage and contact us within 48 hours of delivery. We\'ll send a replacement or issue a full refund immediately.' },
    ],
  },
  {
    category: 'Products',
    items: [
      { q: 'Are your products authentic?', a: 'Absolutely. Every product is sourced directly from verified artisans and brands. We provide a certificate of authenticity for select luxury items.' },
      { q: 'How do I care for my purchases?', a: 'Each product comes with care instructions. Generally: dust regularly, avoid direct sunlight for delicate materials, and use appropriate cleaning products for the material type.' },
      { q: 'Can I order custom sizes or colors?', a: 'For select items, we offer customization. Look for the "Customizable" badge on product pages, or contact us to discuss bespoke requirements.' },
    ],
  },
  {
    category: 'Account & Privacy',
    items: [
      { q: 'Do I need an account to shop?', a: 'No, but creating an account lets you track orders, save wishlists, store addresses, and earn loyalty points on every purchase.' },
      { q: 'How are my loyalty points calculated?', a: 'You earn 1 loyalty point per Rs. 100 spent. Points can be redeemed for discounts on future purchases. 100 points = Rs. 100 off.' },
      { q: 'Is my personal information safe?', a: 'Yes. We use SSL encryption and never share your data with third parties. See our Privacy Policy for full details.' },
    ],
  },
]

export function FaqPage() {
  const [openItem, setOpenItem] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const filtered = faqs.map((cat) => ({
    ...cat,
    items: cat.items.filter(
      (item) =>
        search === '' ||
        item.q.toLowerCase().includes(search.toLowerCase()) ||
        item.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((cat) => cat.items.length > 0)

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-sidebar py-16 text-center px-4">
        <p className="text-sm tracking-widest uppercase text-sidebar-foreground/50 mb-3">Support</p>
        <h1 className="font-serif text-4xl font-semibold text-sidebar-foreground mb-3">
          Frequently Asked Questions
        </h1>
        <p className="text-sidebar-foreground/60 max-w-md mx-auto mb-6">
          Find answers to common questions about orders, shipping, payments, and more.
        </p>
        <div className="relative max-w-sm mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-sidebar-foreground/40" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search FAQs..."
            className="pl-9 bg-sidebar-accent border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/40"
          />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No matching questions found.</p>
        ) : (
          <div className="flex flex-col gap-10">
            {filtered.map((category) => (
              <div key={category.category}>
                <h2 className="font-serif text-xl font-semibold mb-4 text-muted-foreground">{category.category}</h2>
                <div className="flex flex-col gap-2">
                  {category.items.map((item) => {
                    const key = `${category.category}-${item.q}`
                    const isOpen = openItem === key
                    return (
                      <div key={item.q} className="border border-border rounded-sm overflow-hidden">
                        <button
                          onClick={() => setOpenItem(isOpen ? null : key)}
                          className="flex items-center justify-between w-full px-5 py-4 text-left hover:bg-muted/50 transition-colors"
                        >
                          <span className="font-medium text-sm pr-4">{item.q}</span>
                          <ChevronDown className={cn('size-4 text-muted-foreground shrink-0 transition-transform duration-200', isOpen && 'rotate-180')} />
                        </button>
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">
                                {item.a}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-14 text-center bg-muted rounded-sm p-8">
          <h3 className="font-serif text-xl font-semibold mb-2">Still have questions?</h3>
          <p className="text-muted-foreground text-sm mb-4">Our support team is ready to help you.</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <a href="mailto:hello@maisonluxe.pk" className="text-sm text-primary hover:underline">
              hello@maisonluxe.pk
            </a>
            <span className="text-muted-foreground">·</span>
            <a href="tel:+923001234567" className="text-sm text-primary hover:underline">
              +92 300 1234567
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
