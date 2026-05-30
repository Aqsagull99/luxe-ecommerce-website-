import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, ShoppingBag, Heart, User, Menu, X, ChevronDown,
  Sun, Moon, Phone, Mail
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useCartStore } from '@/store/useCartStore'
import { useWishlistStore } from '@/store/useWishlistStore'
import { useAuthStore } from '@/store/useAuthStore'
import { useTheme } from '@/components/theme-provider'
import { cn } from '@/lib/utils'
import { SearchAutocomplete } from '@/components/search/SearchAutocomplete'

const navLinks = [
  {
    label: 'Collections',
    href: '/collections',
    children: [
      { label: 'Living Room', href: '/products?category=living-room' },
      { label: 'Bedroom', href: '/products?category=bedroom' },
      { label: 'Dining Room', href: '/products?category=dining-room' },
      { label: 'Bathroom', href: '/products?category=bathroom' },
      { label: 'Outdoor', href: '/products?category=outdoor' },
    ],
  },
  { label: 'Lighting', href: '/products?category=lighting' },
  { label: 'Art & Mirrors', href: '/products?category=art-mirrors' },
  { label: 'Textiles', href: '/products?category=textiles' },
  { label: 'Sale', href: '/products?sale=true', accent: true },
]

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const location = useLocation()
  const cartCount = useCartStore((s) => s.getItemCount())
  const wishlistCount = useWishlistStore((s) => s.productIds.length)
  const { user, profile, signOut, fetchProfile } = useAuthStore()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setSearchOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (user && !profile) {
      fetchProfile(user.id)
    }
  }, [user, profile])

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-primary text-primary-foreground text-center py-2 text-xs tracking-widest uppercase font-medium">
        <span className="hidden sm:inline">Free shipping on orders over Rs. 5,000 — </span>
        <span>Use code WELCOME10 for 10% off your first order</span>
      </div>

      {/* Top contact bar */}
      <div className="hidden md:flex items-center justify-between px-8 py-2 border-b border-border bg-background text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><Phone className="size-3" /> +92 300 123 4567</span>
          <span className="flex items-center gap-1.5"><Mail className="size-3" /> hello@maisonluxe.pk</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
          <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          <Link to="/faq" className="hover:text-foreground transition-colors">FAQ</Link>
        </div>
      </div>

      {/* Main header */}
      <header
        role="banner"
        className={cn(
          'sticky top-0 z-50 w-full transition-all duration-300',
          scrolled
            ? 'bg-background/95 backdrop-blur-md shadow-sm border-b border-border'
            : 'bg-background border-b border-border'
        )}
      >
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>

            {/* Logo */}
            <Link to="/" className="flex flex-col items-center lg:items-start">
              <span className="text-xl lg:text-2xl font-serif font-semibold tracking-[0.15em] text-foreground uppercase">
                Maison Luxe
              </span>
              <span className="text-[9px] tracking-[0.4em] text-muted-foreground uppercase hidden sm:block">
                Premium Home Decor
              </span>
            </Link>

            {/* Desktop nav */}
            <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-0">
              {navLinks.map((link) =>
                link.children ? (
                  <DropdownMenu key={link.label}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="text-sm tracking-wider uppercase font-medium h-20 rounded-none px-4 gap-1 hover:bg-transparent hover:text-primary border-b-2 border-transparent hover:border-primary transition-colors"
                      >
                        {link.label}
                        <ChevronDown className="size-3 opacity-60" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-52">
                      {link.children.map((child) => (
                        <DropdownMenuItem key={child.href} asChild>
                          <Link
                            to={child.href}
                            className="cursor-pointer text-sm tracking-wide"
                          >
                            {child.label}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/products" className="cursor-pointer text-sm font-medium">
                          View All Collections
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button
                    key={link.label}
                    variant="ghost"
                    asChild
                    className={cn(
                      'text-sm tracking-wider uppercase font-medium h-20 rounded-none px-4 hover:bg-transparent hover:text-primary border-b-2 border-transparent hover:border-primary transition-colors',
                      link.accent && 'text-destructive hover:text-destructive hover:border-destructive'
                    )}
                  >
                    <Link to={link.href}>{link.label}</Link>
                  </Button>
                )
              )}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {/* Search */}
              <Button
                variant="ghost"
                size="icon"
                className="size-10"
                onClick={() => setSearchOpen(!searchOpen)}
              >
                <Search className="size-4" />
              </Button>

              {/* Wishlist */}
              <Button variant="ghost" size="icon" className="size-10 relative" asChild>
                <Link to="/account/wishlist">
                  <Heart className="size-4" />
                  {wishlistCount > 0 && (
                    <Badge className="absolute -top-0.5 -right-0.5 size-4 p-0 flex items-center justify-center text-[10px] rounded-full">
                      {wishlistCount}
                    </Badge>
                  )}
                </Link>
              </Button>

              {/* Cart */}
              <Button variant="ghost" size="icon" className="size-10 relative" asChild>
                <Link to="/cart">
                  <ShoppingBag className="size-4" />
                  {cartCount > 0 && (
                    <Badge className="absolute -top-0.5 -right-0.5 size-4 p-0 flex items-center justify-center text-[10px] rounded-full">
                      {cartCount}
                    </Badge>
                  )}
                </Link>
              </Button>

              {/* Account */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-10">
                      <User className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-3 py-2 text-sm font-medium text-foreground">
                      {profile?.full_name || 'My Account'}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/account">Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/account/orders">My Orders</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/account/wishlist">Wishlist</Link>
                    </DropdownMenuItem>
                    {profile?.role === 'admin' && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to="/admin">Admin Panel</Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => void signOut()} className="text-destructive">
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="ghost" size="icon" className="size-10" asChild>
                  <Link to="/auth">
                    <User className="size-4" />
                  </Link>
                </Button>
              )}

              {/* Theme toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="size-10 hidden sm:flex"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Search bar with autocomplete */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-border overflow-hidden bg-background"
            >
              <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="max-w-lg mx-auto">
                  <SearchAutocomplete
                    placeholder="Search for products, collections..."
                    className="w-full"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
                    Try searching for "sofa", "lighting", "marble table"...
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile nav drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-background border-r border-border lg:hidden overflow-y-auto"
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <span className="font-serif text-lg tracking-widest uppercase">Maison Luxe</span>
                <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                  <X className="size-4" />
                </Button>
              </div>
              <nav aria-label="Mobile navigation" className="p-4 flex flex-col gap-1">
                {navLinks.map((link) => (
                  <div key={link.label}>
                    <Link
                      to={link.children ? '#' : link.href}
                      className={cn(
                        'block py-3 px-2 text-sm tracking-wider uppercase font-medium border-b border-border/50 hover:text-primary transition-colors',
                        link.accent && 'text-destructive'
                      )}
                    >
                      {link.label}
                    </Link>
                    {link.children && (
                      <div className="pl-4 mt-1 mb-2 flex flex-col gap-1">
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            to={child.href}
                            className="py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
              <div className="p-4 border-t border-border mt-auto">
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  >
                    {theme === 'dark' ? <Sun className="size-4 mr-2" /> : <Moon className="size-4 mr-2" />}
                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
