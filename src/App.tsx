import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { HomePage } from '@/pages/HomePage'
import { ProductsPage } from '@/pages/ProductsPage'
import { ProductDetailPage } from '@/pages/ProductDetailPage'
import { CartPage } from '@/pages/CartPage'
import { CheckoutPage } from '@/pages/CheckoutPage'
import { OrderConfirmationPage } from '@/pages/OrderConfirmationPage'
import { AuthPage } from '@/pages/AuthPage'
import { AccountPage } from '@/pages/AccountPage'
import { AdminPage } from '@/pages/AdminPage'
import { SearchPage } from '@/pages/SearchPage'
import { AboutPage } from '@/pages/AboutPage'
import { ContactPage } from '@/pages/ContactPage'
import { FaqPage } from '@/pages/FaqPage'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/useAuthStore'

function AuthListener() {
  const { setUser, setLoading, fetchProfile } = useAuthStore()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        void fetchProfile(session.user.id)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchProfile(session.user.id)
        }
        setLoading(false)
      })()
    })

    return () => subscription.unsubscribe()
  }, [])

  return null
}

export function App() {
  return (
    <BrowserRouter>
      <AuthListener />
      <Routes>
        {/* Auth — no layout */}
        <Route path="/auth" element={<AuthPage />} />

        {/* Admin — no layout */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/:tab" element={<AdminPage />} />

        {/* Main site — with layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:slug" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/account" element={<Navigate to="/account/overview" replace />} />
          <Route path="/account/:tab" element={<AccountPage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
