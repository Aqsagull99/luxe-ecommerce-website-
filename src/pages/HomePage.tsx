import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { ArrowRight, Star, Quote, ChevronLeft, ChevronRight, Award, Truck, RotateCcw, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProductCard } from '@/components/products/ProductCard'
import { supabase, type Product, type Category } from '@/lib/supabase'
import { cn } from '@/lib/utils'

const testimonials = [
  {
    id: 1,
    name: 'Amna Qureshi',
    role: 'Interior Designer, Lahore',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
    rating: 5,
    text: 'Maison Luxe has completely transformed how I source pieces for my clients. The quality is unmatched and each item arrives in pristine condition. My clients are always impressed.',
  },
  {
    id: 2,
    name: 'Hassan Malik',
    role: 'Architect, Karachi',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    rating: 5,
    text: 'The marble dining table I ordered exceeded all expectations. The craftsmanship is extraordinary and the customer service was exceptional from order to delivery.',
  },
  {
    id: 3,
    name: 'Sana Ahmed',
    role: 'Homeowner, Islamabad',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
    rating: 5,
    text: 'I redesigned my entire living room with pieces from Maison Luxe. Every single item is a work of art. The velvet sofa is the crown jewel of my home now.',
  },
]

const features = [
  { icon: Award, title: 'Curated Quality', desc: 'Every piece hand-selected by our design team' },
  { icon: Truck, title: 'White Glove Delivery', desc: 'Professional installation across Pakistan' },
  { icon: RotateCcw, title: '30-Day Returns', desc: 'Hassle-free returns on all orders' },
  { icon: Shield, title: '5-Year Guarantee', desc: 'Quality assurance on all furniture' },
]

function AnimatedSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [testimonialIdx, setTestimonialIdx] = useState(0)
  const [loading, setLoading] = useState(true)
  const [heroSlide, setHeroSlide] = useState(0)

  const heroSlides = [
    {
      image: 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?w=1920&q=90',
      tag: 'New Collection 2026',
      title: 'Where Luxury\nMeets Home',
      subtitle: 'Discover handcrafted pieces that transform spaces into sanctuaries of elegance.',
      cta: 'Explore Collection',
      ctaHref: '/products',
    },
    {
      image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1920&q=90',
      tag: 'Master Bedroom',
      title: 'Rest in\nAbsolute Luxury',
      subtitle: 'From silk canopy beds to handwoven Persian rugs — your bedroom, reimagined.',
      cta: 'Shop Bedroom',
      ctaHref: '/products?category=bedroom',
    },
    {
      image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1920&q=90',
      tag: 'Living Room',
      title: 'Spaces That\nInspire Living',
      subtitle: 'Statement furniture and curated accessories for the discerning home.',
      cta: 'Shop Living Room',
      ctaHref: '/products?category=living-room',
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroSlide((prev) => (prev + 1) % heroSlides.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    async function load() {
      const [productsRes, catsRes] = await Promise.all([
        supabase
          .from('products')
          .select('*, images:product_images(*), category:categories(*)')
          .eq('is_active', true)
          .eq('is_featured', true)
          .order('created_at', { ascending: false })
          .limit(8),
        supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('sort_order'),
      ])
      if (productsRes.data) setFeaturedProducts(productsRes.data as Product[])
      if (catsRes.data) setCategories(catsRes.data)
      setLoading(false)
    }
    void load()
  }, [])

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-[85vh] min-h-[600px] overflow-hidden">
        {heroSlides.map((slide, i) => (
          <motion.div
            key={i}
            className="absolute inset-0"
            initial={false}
            animate={{ opacity: i === heroSlide ? 1 : 0 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/30 to-transparent" />
          </motion.div>
        ))}

        {/* Hero content */}
        <div className="relative z-10 h-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          <AnimatePresence key={heroSlide}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-xl"
            >
              <Badge
                variant="outline"
                className="border-white/40 text-white/90 bg-white/10 backdrop-blur-sm mb-6 tracking-widest text-[10px] uppercase"
              >
                {heroSlides[heroSlide].tag}
              </Badge>
              <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-semibold text-white leading-tight mb-6 whitespace-pre-line">
                {heroSlides[heroSlide].title}
              </h1>
              <p className="text-white/80 text-lg mb-10 leading-relaxed max-w-sm">
                {heroSlides[heroSlide].subtitle}
              </p>
              <div className="flex items-center gap-4">
                <Button
                  size="lg"
                  className="bg-white text-foreground hover:bg-white/90 font-medium tracking-wide gap-2 px-8"
                  asChild
                >
                  <Link to={heroSlides[heroSlide].ctaHref}>
                    {heroSlides[heroSlide].cta}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/50 text-white hover:bg-white/10 tracking-wide"
                  asChild
                >
                  <Link to="/about">Our Story</Link>
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setHeroSlide(i)}
              className={cn(
                'h-0.5 transition-all duration-500 rounded-full',
                i === heroSlide ? 'w-8 bg-white' : 'w-4 bg-white/40'
              )}
            />
          ))}
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 right-8 z-10 flex flex-col items-center gap-2 text-white/60"
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="w-px h-12 bg-white/30" />
          <span className="text-[10px] tracking-widest uppercase rotate-90">Scroll</span>
        </motion.div>
      </section>

      {/* Features strip */}
      <section className="bg-primary text-primary-foreground py-4 overflow-hidden">
        <div className="flex animate-none">
          <div className="flex items-center gap-16 px-8 w-full justify-around flex-wrap gap-y-3 py-1">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3 text-sm">
                <Icon className="size-4 opacity-80 shrink-0" />
                <span className="font-medium tracking-wide">{title}</span>
                <span className="opacity-70 hidden lg:inline">— {desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="text-center mb-12">
            <p className="text-xs tracking-[0.4em] uppercase text-muted-foreground mb-3">
              Explore by Room
            </p>
            <h2 className="font-serif text-4xl font-semibold text-foreground">
              Shop Collections
            </h2>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {categories.slice(0, 8).map((cat) => (
            <AnimatedSection key={cat.id}>
              <Link
                to={`/products?category=${cat.slug}`}
                className="group relative aspect-square overflow-hidden rounded-sm block"
              >
                <img
                  src={cat.image_url || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600'}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <h3 className="text-white font-serif text-lg font-medium tracking-wide">
                    {cat.name}
                  </h3>
                  <p className="text-white/70 text-xs mt-0.5 flex items-center gap-1 group-hover:gap-2 transition-all">
                    Shop Now <ArrowRight className="size-3" />
                  </p>
                </div>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* Full-width editorial banner */}
      <section className="relative h-[500px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=1920&q=90"
          alt="Editorial collection"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-foreground/40" />
        <AnimatedSection className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white max-w-2xl px-4">
            <p className="text-xs tracking-[0.5em] uppercase opacity-80 mb-4">Limited Edition</p>
            <h2 className="font-serif text-5xl font-semibold mb-6 leading-tight">
              The Milano Collection
            </h2>
            <p className="text-white/80 text-lg mb-8">
              Italian craftsmanship meets Pakistani elegance. Available for a limited time.
            </p>
            <Button
              size="lg"
              className="bg-white text-foreground hover:bg-white/90 tracking-wide gap-2"
              asChild
            >
              <Link to="/products?collection=milano">
                Discover More <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </AnimatedSection>
      </section>

      {/* Featured products */}
      <section className="py-20 max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-xs tracking-[0.4em] uppercase text-muted-foreground mb-3">
                Handpicked for You
              </p>
              <h2 className="font-serif text-4xl font-semibold text-foreground">
                Featured Pieces
              </h2>
            </div>
            <Button variant="outline" className="gap-2 tracking-wide hidden sm:flex" asChild>
              <Link to="/products">
                View All <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </AnimatedSection>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-muted rounded-sm mb-3" />
                <div className="h-3 bg-muted rounded w-1/3 mb-2" />
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="flex justify-center mt-10">
          <Button size="lg" className="gap-2 tracking-wide px-10" asChild>
            <Link to="/products">
              Shop All Products <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Split editorial */}
      <section className="grid md:grid-cols-2 min-h-[520px]">
        <div className="relative overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=900&q=90"
            alt="Craftsmanship"
            className="w-full h-full object-cover min-h-[300px]"
          />
          <div className="absolute inset-0 bg-foreground/20" />
        </div>
        <AnimatedSection className="bg-cream dark:bg-card flex items-center justify-center p-12 lg:p-20">
          <div className="max-w-sm">
            <p className="text-xs tracking-[0.4em] uppercase text-muted-foreground mb-4">
              Our Philosophy
            </p>
            <h2 className="font-serif text-4xl font-semibold text-foreground mb-6 leading-tight">
              Crafted to Last Generations
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              We believe your home should tell your story. Each piece in our collection is selected
              for its exceptional craftsmanship, sustainable materials, and timeless design that
              only grows more beautiful with age.
            </p>
            <Button variant="outline" className="gap-2 tracking-wide" asChild>
              <Link to="/about">
                Our Story <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </AnimatedSection>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-12">
              <p className="text-xs tracking-[0.4em] uppercase text-muted-foreground mb-3">
                Client Stories
              </p>
              <h2 className="font-serif text-4xl font-semibold text-foreground">
                What Our Clients Say
              </h2>
            </div>
          </AnimatedSection>

          <div className="relative max-w-3xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={testimonialIdx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="text-center"
              >
                <Quote className="size-8 text-[var(--gold)] mx-auto mb-6 opacity-60" />
                <p className="text-xl text-foreground font-serif italic leading-relaxed mb-8">
                  "{testimonials[testimonialIdx].text}"
                </p>
                <div className="flex items-center justify-center gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-4 fill-[var(--gold)] text-[var(--gold)]" />
                  ))}
                </div>
                <div className="flex items-center justify-center gap-3">
                  <img
                    src={testimonials[testimonialIdx].avatar}
                    alt={testimonials[testimonialIdx].name}
                    className="size-12 rounded-full object-cover border-2 border-border"
                  />
                  <div className="text-left">
                    <p className="font-semibold text-foreground text-sm">
                      {testimonials[testimonialIdx].name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {testimonials[testimonialIdx].role}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-center gap-3 mt-10">
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() =>
                  setTestimonialIdx(
                    (prev) => (prev - 1 + testimonials.length) % testimonials.length
                  )
                }
              >
                <ChevronLeft className="size-4" />
              </Button>
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setTestimonialIdx(i)}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all duration-300',
                    i === testimonialIdx ? 'bg-primary w-6' : 'bg-border'
                  )}
                />
              ))}
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() =>
                  setTestimonialIdx((prev) => (prev + 1) % testimonials.length)
                }
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-border">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { value: '1,200+', label: 'Curated Products' },
              { value: '15,000+', label: 'Happy Clients' },
              { value: '50+', label: 'Master Artisans' },
              { value: '11 Years', label: 'Of Excellence' },
            ].map(({ value, label }) => (
              <AnimatedSection key={label}>
                <div>
                  <p className="shimmer-gold font-serif text-4xl font-semibold mb-2">{value}</p>
                  <p className="text-sm text-muted-foreground tracking-wide">{label}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-24 bg-primary text-primary-foreground text-center px-4">
        <AnimatedSection>
          <p className="text-xs tracking-[0.5em] uppercase opacity-70 mb-4">Exclusive Access</p>
          <h2 className="font-serif text-4xl font-semibold mb-4">
            Become a Maison Insider
          </h2>
          <p className="opacity-80 mb-10 max-w-md mx-auto leading-relaxed">
            First access to new arrivals, private sales, and design inspiration delivered
            directly to your inbox.
          </p>
          <form
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 h-10 px-4 rounded-sm bg-primary-foreground/10 border border-primary-foreground/30 text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:border-primary-foreground/60 text-sm"
            />
            <Button
              type="submit"
              variant="secondary"
              className="shrink-0 font-medium tracking-wide px-8"
            >
              Subscribe
            </Button>
          </form>
          <p className="text-[11px] opacity-50 mt-4">
            No spam. Unsubscribe anytime. Privacy guaranteed.
          </p>
        </AnimatedSection>
      </section>
    </div>
  )
}

// AnimatePresence shim — real one imported from framer-motion where needed
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function AnimatePresence({ children }: { children: React.ReactNode; [key: string]: any }) {
  return <>{children}</>
}
