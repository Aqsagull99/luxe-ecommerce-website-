import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Grid3X3, List, SlidersHorizontal, X, ChevronDown, ChevronUp, Search
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { ProductCard } from '@/components/products/ProductCard'
import { supabase, type Product, type Category } from '@/lib/supabase'
import { cn } from '@/lib/utils'

type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'rating' | 'popular'

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
]

function FilterSection({
  title, defaultOpen = true, children
}: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div>
      <button
        className="flex items-center justify-between w-full py-3 text-sm font-medium tracking-wide text-foreground hover:text-primary transition-colors"
        onClick={() => setOpen(!open)}
      >
        {title}
        {open ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
      <Separator />
    </div>
  )
}

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [layout, setLayout] = useState<'grid' | 'list'>('grid')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  // Filter state
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get('category') ? [searchParams.get('category')!] : []
  )
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 15000])
  const [minRating, setMinRating] = useState(0)
  const [onSaleOnly, setOnSaleOnly] = useState(searchParams.get('sale') === 'true')
  const [inStockOnly, setInStockOnly] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [searchQ, setSearchQ] = useState(searchParams.get('q') ?? '')
  const [page, setPage] = useState(1)
  const pageSize = 12

  useEffect(() => {
    supabase.from('categories').select('*').eq('is_active', true).order('sort_order')
      .then(({ data }) => { if (data) setCategories(data) })
  }, [])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('products')
      .select('*, images:product_images(*), category:categories(*)', { count: 'exact' })
      .eq('is_active', true)

    if (selectedCategories.length > 0) {
      const slugs = selectedCategories
      const catIds = categories
        .filter((c) => slugs.includes(c.slug))
        .map((c) => c.id)
      if (catIds.length > 0) query = query.in('category_id', catIds)
    }

    if (priceRange[0] > 0) query = query.gte('price', priceRange[0])
    if (priceRange[1] < 15000) query = query.lte('price', priceRange[1])
    if (minRating > 0) query = query.gte('rating_avg', minRating)
    if (onSaleOnly) query = query.not('sale_price', 'is', null)
    if (inStockOnly) query = query.gt('stock_quantity', 0)
    if (searchQ) query = query.ilike('name', `%${searchQ}%`)

    switch (sortBy) {
      case 'newest': query = query.order('created_at', { ascending: false }); break
      case 'popular': query = query.order('rating_count', { ascending: false }); break
      case 'rating': query = query.order('rating_avg', { ascending: false }); break
      case 'price_asc': query = query.order('price', { ascending: true }); break
      case 'price_desc': query = query.order('price', { ascending: false }); break
    }

    const from = (page - 1) * pageSize
    query = query.range(from, from + pageSize - 1)

    const { data, count } = await query
    if (data) setProducts(data as Product[])
    if (count !== null) setTotal(count)
    setLoading(false)
  }, [selectedCategories, priceRange, minRating, onSaleOnly, inStockOnly, searchQ, sortBy, page, categories])

  useEffect(() => {
    if (categories.length > 0 || selectedCategories.length === 0) {
      void fetchProducts()
    }
  }, [fetchProducts, categories.length])

  const totalPages = Math.ceil(total / pageSize)

  const clearFilters = () => {
    setSelectedCategories([])
    setPriceRange([0, 15000])
    setMinRating(0)
    setOnSaleOnly(false)
    setInStockOnly(false)
    setSearchQ('')
    setSortBy('newest')
    setPage(1)
    setSearchParams({})
  }

  const activeFilterCount = [
    selectedCategories.length > 0,
    priceRange[0] > 0 || priceRange[1] < 15000,
    minRating > 0,
    onSaleOnly,
    inStockOnly,
  ].filter(Boolean).length

  const FiltersPanel = () => (
    <div className="space-y-0">
      {/* Search within */}
      <FilterSection title="Search Products">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQ}
            onChange={(e) => { setSearchQ(e.target.value); setPage(1) }}
            className="pl-8 h-8 text-sm"
          />
        </div>
      </FilterSection>

      {/* Categories */}
      <FilterSection title="Category">
        <div className="flex flex-col gap-2.5">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-2.5">
              <Checkbox
                id={`cat-${cat.slug}`}
                checked={selectedCategories.includes(cat.slug)}
                onCheckedChange={(checked) => {
                  setSelectedCategories((prev) =>
                    checked
                      ? [...prev, cat.slug]
                      : prev.filter((s) => s !== cat.slug)
                  )
                  setPage(1)
                }}
              />
              <Label htmlFor={`cat-${cat.slug}`} className="text-sm cursor-pointer font-normal">
                {cat.name}
              </Label>
            </div>
          ))}
        </div>
      </FilterSection>

      {/* Price range */}
      <FilterSection title="Price Range">
        <div className="px-1">
          <Slider
            min={0} max={15000} step={500}
            value={priceRange}
            onValueChange={(v) => { setPriceRange(v as [number, number]); setPage(1) }}
            className="mb-4"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Rs. {priceRange[0].toLocaleString()}</span>
            <span>Rs. {priceRange[1].toLocaleString()}</span>
          </div>
        </div>
      </FilterSection>

      {/* Rating */}
      <FilterSection title="Minimum Rating">
        <div className="flex flex-col gap-2">
          {[4, 3, 2].map((r) => (
            <button
              key={r}
              onClick={() => { setMinRating(minRating === r ? 0 : r); setPage(1) }}
              className={cn(
                'flex items-center gap-2 text-sm py-1 px-2 rounded-sm transition-colors text-left',
                minRating === r ? 'bg-primary/10 text-primary' : 'hover:bg-accent'
              )}
            >
              <span className="text-[var(--gold)]">{'★'.repeat(r)}{'☆'.repeat(5 - r)}</span>
              <span className="text-xs text-muted-foreground">& above</span>
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Quick filters */}
      <FilterSection title="Quick Filters">
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2.5">
            <Checkbox
              id="on-sale"
              checked={onSaleOnly}
              onCheckedChange={(v) => { setOnSaleOnly(!!v); setPage(1) }}
            />
            <Label htmlFor="on-sale" className="text-sm cursor-pointer font-normal">On Sale</Label>
          </div>
          <div className="flex items-center gap-2.5">
            <Checkbox
              id="in-stock"
              checked={inStockOnly}
              onCheckedChange={(v) => { setInStockOnly(!!v); setPage(1) }}
            />
            <Label htmlFor="in-stock" className="text-sm cursor-pointer font-normal">In Stock Only</Label>
          </div>
        </div>
      </FilterSection>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Page header */}
      <div className="border-b border-border bg-card py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-screen-xl mx-auto">
          <p className="text-xs tracking-[0.4em] uppercase text-muted-foreground mb-2">
            {selectedCategories.length === 1
              ? categories.find((c) => c.slug === selectedCategories[0])?.name
              : 'All Collections'}
          </p>
          <h1 className="font-serif text-4xl font-semibold text-foreground">
            {searchQ ? `Results for "${searchQ}"` : 'Shop All Products'}
          </h1>
          <p className="text-muted-foreground text-sm mt-2">
            {loading ? 'Loading...' : `${total} pieces`}
          </p>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs tracking-[0.3em] uppercase font-semibold text-foreground">
                  Filters
                </span>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
                  >
                    <X className="size-3" /> Clear all
                  </button>
                )}
              </div>
              <FiltersPanel />
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Mobile filter toggle */}
                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden gap-2"
                  onClick={() => setMobileFiltersOpen(true)}
                >
                  <SlidersHorizontal className="size-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge className="size-4 p-0 flex items-center justify-center text-[10px] ml-1">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>

                {/* Active filter badges */}
                {selectedCategories.map((slug) => (
                  <Badge key={slug} variant="secondary" className="gap-1 text-xs">
                    {categories.find((c) => c.slug === slug)?.name}
                    <button onClick={() => setSelectedCategories((p) => p.filter((s) => s !== slug))}>
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
                {onSaleOnly && (
                  <Badge variant="secondary" className="gap-1 text-xs">
                    Sale <button onClick={() => setOnSaleOnly(false)}><X className="size-3" /></button>
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <Select value={sortBy} onValueChange={(v) => { setSortBy(v as SortOption); setPage(1) }}>
                  <SelectTrigger className="h-8 text-sm w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex border border-border rounded-sm overflow-hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn('size-8 rounded-none', layout === 'grid' && 'bg-primary text-primary-foreground')}
                    onClick={() => setLayout('grid')}
                  >
                    <Grid3X3 className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn('size-8 rounded-none', layout === 'list' && 'bg-primary text-primary-foreground')}
                    onClick={() => setLayout('list')}
                  >
                    <List className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Products grid / list */}
            {loading ? (
              <div className={cn(
                layout === 'grid'
                  ? 'grid grid-cols-2 md:grid-cols-3 gap-5'
                  : 'flex flex-col gap-3'
              )}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className={cn('animate-pulse', layout === 'list' ? 'flex gap-4' : '')}>
                    <div className={cn('bg-muted rounded-sm', layout === 'grid' ? 'aspect-[3/4]' : 'w-44 h-44 shrink-0')} />
                    {layout === 'list' && (
                      <div className="flex-1 py-2">
                        <div className="h-3 bg-muted rounded w-1/4 mb-2" />
                        <div className="h-5 bg-muted rounded w-3/4 mb-2" />
                        <div className="h-4 bg-muted rounded w-1/2" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-muted-foreground text-lg font-serif">No products found</p>
                <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters</p>
                <Button variant="outline" className="mt-6" onClick={clearFilters}>
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <div className={cn(
                layout === 'grid'
                  ? 'grid grid-cols-2 md:grid-cols-3 gap-5'
                  : 'flex flex-col gap-3'
              )}>
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} layout={layout} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => Math.abs(p - page) <= 2)
                  .map((p) => (
                    <Button
                      key={p}
                      variant={p === page ? 'default' : 'outline'}
                      size="sm"
                      className="size-8 p-0"
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </Button>
                  ))}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filters sheet */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setMobileFiltersOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed inset-y-0 left-0 z-50 w-80 bg-background border-r border-border overflow-y-auto lg:hidden"
            >
              <div className="p-4 border-b border-border flex items-center justify-between">
                <span className="font-semibold tracking-wide">Filters</span>
                <Button variant="ghost" size="icon" onClick={() => setMobileFiltersOpen(false)}>
                  <X className="size-4" />
                </Button>
              </div>
              <div className="p-4">
                <FiltersPanel />
              </div>
              <div className="p-4 border-t border-border sticky bottom-0 bg-background">
                <Button className="w-full" onClick={() => setMobileFiltersOpen(false)}>
                  View {total} Results
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
