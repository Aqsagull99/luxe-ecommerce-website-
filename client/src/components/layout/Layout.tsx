import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { cn } from '@/lib/utils'

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Skip to content — accessibility */}
      <a
        href="#main-content"
        className={cn(
          'sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100]',
          'bg-background text-foreground border border-border px-4 py-2 rounded-sm text-sm font-medium'
        )}
      >
        Skip to main content
      </a>
      <Header />
      <main id="main-content" className="flex-1" role="main">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
