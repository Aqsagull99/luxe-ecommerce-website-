import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SEO } from '@/components/SEO'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { ProductCard } from '@/components/products/ProductCard'
import { supabase, type Product } from '@/lib/supabase'

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const [input, setInput] = useState(query)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setInput(query)
    if (query.trim().length < 2) { setProducts([]); return }
    void fetchResults(query)
  }, [query])

  const fetchResults = async (q: string) => {
    setLoading(true)
    const { data } = await supabase
      .from('products')
      .select(`*, images:product_images(url, is_primary, sort_order), category:categories(name, slug)`)
      .eq('is_active', true)
      .or(`name.ilike.%${q}%,short_description.ilike.%${q}%,sku.ilike.%${q}%`)
      .order('is_featured', { ascending: false })
      .limit(24)
    setProducts((data as Product[]) ?? [])
    setLoading(false)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) setSearchParams({ q: input.trim() })
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Search" description="Search for premium home decor products at Maison Luxe." />
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Search bar */}
        <div className="max-w-2xl mx-auto mb-10">
          <h1 className="font-serif text-4xl font-semibold text-center mb-6">Search</h1>
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Search products, categories..."
              className="pl-11 pr-10 h-12 text-base"
            />
            {input && (
              <button
                type="button"
                onClick={() => { setInput(''); setSearchParams({}) }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </form>
        </div>

        {/* Results */}
        {query && (
          <div>
            <p className="text-sm text-muted-foreground mb-6">
              {loading ? 'Searching...' : `${products.length} result${products.length !== 1 ? 's' : ''} for "${query}"`}
            </p>

            {loading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-72 rounded-sm" />)}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <Search className="size-16 mx-auto mb-4 text-muted-foreground opacity-30" />
                <h2 className="font-serif text-2xl font-semibold mb-2">No results found</h2>
                <p className="text-muted-foreground">Try different keywords or browse our collections</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        )}

        {!query && (
          <div className="text-center py-20 text-muted-foreground">
            <Search className="size-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg">Start typing to search our collection</p>
          </div>
        )}
      </div>
    </div>
  )
}
