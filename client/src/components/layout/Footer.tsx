import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useState } from 'react'

const footerLinks = {
  Shop: [
    { label: 'Living Room', href: '/products?category=living-room' },
    { label: 'Bedroom', href: '/products?category=bedroom' },
    { label: 'Dining Room', href: '/products?category=dining-room' },
    { label: 'Lighting', href: '/products?category=lighting' },
    { label: 'Art & Mirrors', href: '/products?category=art-mirrors' },
    { label: 'Sale', href: '/products?sale=true' },
  ],
  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'Our Story', href: '/about#story' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press', href: '/press' },
    { label: 'Contact', href: '/contact' },
  ],
  Support: [
    { label: 'FAQ', href: '/faq' },
    { label: 'Shipping Policy', href: '/shipping' },
    { label: 'Returns & Refunds', href: '/returns' },
    { label: 'Track Order', href: '/account/orders' },
    { label: 'Size Guide', href: '/size-guide' },
  ],
}

const paymentMethods = [
  { name: 'EasyPaisa', color: 'bg-green-500' },
  { name: 'JazzCash', color: 'bg-red-500' },
  { name: 'Bank Transfer', color: 'bg-blue-600' },
  { name: 'COD', color: 'bg-amber-500' },
]

export function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setSubscribed(true)
      setEmail('')
    }
  }

  return (
    <footer className="bg-sidebar text-sidebar-foreground">
      {/* Newsletter section */}
      <div className="border-b border-sidebar-border">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <h3 className="font-serif text-2xl font-semibold tracking-wide mb-2">
                Join the Maison Luxe Circle
              </h3>
              <p className="text-sidebar-foreground/70 text-sm">
                Exclusive access to new arrivals, design inspiration, and members-only offers.
              </p>
            </div>
            <div className="w-full lg:w-auto">
              {subscribed ? (
                <p className="text-sm text-sidebar-primary font-medium flex items-center gap-2">
                  <Heart className="size-4 fill-current" />
                  Thank you for subscribing!
                </p>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2 w-full lg:w-[380px]">
                  <Input
                    type="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/50 flex-1"
                  />
                  <Button
                    type="submit"
                    className="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 whitespace-nowrap"
                  >
                    Subscribe
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main footer links */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-4">
              <span className="font-serif text-2xl font-semibold tracking-[0.15em] uppercase text-sidebar-foreground">
                Maison Luxe
              </span>
              <div className="text-[9px] tracking-[0.4em] text-sidebar-foreground/60 uppercase mt-0.5">
                Premium Home Decor
              </div>
            </Link>
            <p className="text-sm text-sidebar-foreground/70 leading-relaxed mb-6 max-w-xs">
              Curating the world's finest home decor since 2015. Each piece is selected for its
              exceptional craftsmanship, timeless design, and enduring quality.
            </p>
            <div className="flex flex-col gap-2.5 text-sm text-sidebar-foreground/70 mb-6">
              <span className="flex items-center gap-2.5">
                <Phone className="size-3.5 shrink-0" />
                +92 300 123 4567
              </span>
              <span className="flex items-center gap-2.5">
                <Mail className="size-3.5 shrink-0" />
                hello@maisonluxe.pk
              </span>
              <span className="flex items-center gap-2.5">
                <MapPin className="size-3.5 shrink-0" />
                14 Gulberg III, Lahore, Pakistan
              </span>
            </div>
            <div className="flex items-center gap-3">
              {[
                { label: 'IG', href: '#' },
                { label: 'FB', href: '#' },
                { label: 'TW', href: '#' },
                { label: 'YT', href: '#' },
              ].map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="size-8 flex items-center justify-center rounded-full border border-sidebar-border hover:border-sidebar-primary hover:text-sidebar-primary transition-colors text-[10px] font-semibold"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-xs tracking-[0.3em] uppercase font-semibold mb-5 text-sidebar-foreground/90">
                {heading}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Bottom bar */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-sidebar-foreground/50">
            © 2026 Maison Luxe. All rights reserved. Crafted with{' '}
            <Heart className="size-3 inline fill-current text-red-400" /> in Lahore.
          </p>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <span className="text-xs text-sidebar-foreground/50 mr-1">We accept:</span>
            {paymentMethods.map((method) => (
              <span
                key={method.name}
                className={`${method.color} text-white text-[10px] font-medium px-2 py-0.5 rounded`}
              >
                {method.name}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-center gap-4 mt-4">
          {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
            <Link
              key={item}
              to="#"
              className="text-[11px] text-sidebar-foreground/40 hover:text-sidebar-foreground/70 transition-colors"
            >
              {item}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  )
}
