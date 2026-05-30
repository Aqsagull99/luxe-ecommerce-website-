import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, TrendingUp, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

interface SearchSuggestion {
  id: string
  name: string
  slug: string
  image_url?: string
  price: number
  category_name?: string
}

interface SearchAutocompleteProps {
  className?: string
  placeholder?: string
}

export function SearchAutocomplete({ className, placeholder = 'Search products...' }: SearchAutocompleteProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('maison-recent-searches') ?? '[]')
    } catch { return [] }
  })
  const inputRef = useRef<HTMLInputElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const navigate = useNavigate()

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setSuggestions([]); return }
    const { data } = await supabase
      .from('products')
      .select('id, name, slug, price, images:product_images(url), category:categories(name)')
      .eq('is_active', true)
      .or(`name.ilike.%${q}%,short_description.ilike.%${q}%`)
      .limit(6)
    setSuggestions((data ?? []).map((d: any) => ({
      id: d.id, name: d.name, slug: d.slug,
      image_url: d.images?.[0]?.url,
      price: d.sale_price ?? d.price,
      category_name: d.category?.name,
    })))
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(query), 250)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, fetchSuggestions])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const saveRecentSearch = (q: string) => {
    const updated = [q, ...recentSearches.filter((s) => s !== q)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('maison-recent-searches', JSON.stringify(updated))
  }

  const handleSelect = (suggestion: SearchSuggestion) => {
    setIsOpen(false)
    setQuery('')
    navigate(`/products/${suggestion.slug}`)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      saveRecentSearch(query.trim())
      setIsOpen(false)
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = query.length >= 2 ? suggestions : recentSearches.map((s) => ({ id: s, name: s, slug: '', price: 0 }))
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex((prev) => Math.min(prev + 1, items.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex((prev) => Math.max(prev - 1, -1)) }
    else if (e.key === 'Enter' && selectedIndex >= 0 && items[selectedIndex]) {
      e.preventDefault()
      if ('slug' in items[selectedIndex] && items[selectedIndex].slug) {
        handleSelect(items[selectedIndex] as SearchSuggestion)
      } else {
        const q = items[selectedIndex].name
        saveRecentSearch(q); navigate(`/search?q=${encodeURIComponent(q)}`); setIsOpen(false)
      }
    } else setSelectedIndex(-1)
  }

  const showRecent = query.length < 2 && recentSearches.length > 0 && isOpen
  const showSuggestions = query.length >= 2 && isOpen

  return (
    <div ref={wrapperRef} className={cn('relative', className)}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setIsOpen(true); setSelectedIndex(-1) }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full h-10 pl-9 pr-9 text-sm bg-muted/50 border border-border rounded-sm focus:outline-none focus:border-primary transition-colors"
            aria-label="Search products"
            aria-expanded={isOpen}
            aria-autocomplete="list"
            role="combobox"
          />
          {query && (
            <button type="button" onClick={() => { setQuery(''); setSuggestions([]); inputRef.current?.focus() }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </form>

      {(showRecent || showSuggestions) && (
        <div className="absolute top-full left-0 right-3 z-50 mt-1 bg-background border border-border rounded-sm shadow-lg overflow-hidden" role="listbox">
          {showRecent && (
            <div>
              <div className="px-3 py-2 text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Clock className="size-3" /> Recent Searches
              </div>
              {recentSearches.map((s, i) => (
                <button
                  key={s} role="option" aria-selected={i === selectedIndex}
                  className={cn('w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors flex items-center gap-2', i === selectedIndex && 'bg-muted')}
                  onClick={() => { saveRecentSearch(s); setIsOpen(false); navigate(`/search?q=${encodeURIComponent(s)}`) }}
                >
                  <Clock className="size-3 text-muted-foreground shrink-0" />
                  <span className="truncate">{s}</span>
                </button>
              ))}
            </div>
          )}
          {showSuggestions && suggestions.length > 0 && (
            <div>
              <div className="px-3 py-2 text-xs font-medium text-muted-foreground flex items-center gap-1.5 border-t border-border">
                <TrendingUp className="size-3" /> Suggestions
              </div>
              {suggestions.map((s, i) => (
                <button
                  key={s.id} role="option" aria-selected={i === selectedIndex}
                  className={cn('w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors flex items-center gap-3', i === selectedIndex && 'bg-muted')}
                  onClick={() => handleSelect(s)}
                >
                  {s.image_url && (
                    <img src={s.image_url} alt="" className="size-8 rounded object-cover shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground">Rs. {s.price.toLocaleString()}{s.category_name ? ` · ${s.category_name}` : ''}</p>
                  </div>
                </button>
              ))}
              <button
                className="w-full text-left px-3 py-2 text-sm text-primary hover:bg-muted transition-colors border-t border-border font-medium"
                onClick={() => { saveRecentSearch(query); navigate(`/search?q=${encodeURIComponent(query)}`); setIsOpen(false) }}
              >
                View all results for "{query}"
              </button>
            </div>
          )}
          {showSuggestions && suggestions.length === 0 && (
            <div className="px-3 py-4 text-sm text-muted-foreground text-center">No suggestions found</div>
          )}
        </div>
      )}
    </div>
  )
}
