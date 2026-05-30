import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { SEO } from '@/components/SEO'
import { motion } from 'framer-motion'
import {
  User, Package, Heart, MapPin, Settings, LogOut,
  ChevronRight, Star, Eye, Truck, CheckCircle2, Clock, XCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuthStore } from '@/store/useAuthStore'
import { useWishlistStore } from '@/store/useWishlistStore'
import { supabase, type Order, type Product } from '@/lib/supabase'
import { cn } from '@/lib/utils'

type Tab = 'overview' | 'orders' | 'wishlist' | 'addresses' | 'settings'

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="size-4 text-amber-500" />,
  processing: <Package className="size-4 text-blue-500" />,
  shipped: <Truck className="size-4 text-cyan-500" />,
  delivered: <CheckCircle2 className="size-4 text-green-500" />,
  cancelled: <XCircle className="size-4 text-destructive" />,
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  processing: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  shipped: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/30',
  delivered: 'bg-green-500/10 text-green-600 border-green-500/30',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/30',
}

export function AccountPage() {
  const { tab = 'overview' } = useParams<{ tab?: Tab }>()
  const activeTab = tab as Tab
  const navigate = useNavigate()
  const { user, profile, signOut, fetchProfile } = useAuthStore()
  const wishlistIds = useWishlistStore((s) => s.productIds)

  const [orders, setOrders] = useState<Order[]>([])
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [loadingWishlist, setLoadingWishlist] = useState(false)

  // Profile edit state
  const [editForm, setEditForm] = useState({ full_name: '', phone: '' })
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  useEffect(() => {
    if (!user) { navigate('/auth?redirect=/account'); return }
    if (profile) setEditForm({ full_name: profile.full_name ?? '', phone: profile.phone ?? '' })
  }, [user, profile])

  useEffect(() => {
    if (!user) return
    if (activeTab === 'orders' || activeTab === 'overview') void fetchOrders()
    if (activeTab === 'wishlist') void fetchWishlist()
  }, [activeTab, user])

  const fetchOrders = async () => {
    setLoadingOrders(true)
    const { data } = await supabase
      .from('orders')
      .select(`*, items:order_items(*)`)
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(activeTab === 'overview' ? 3 : 50)
    setOrders((data as Order[]) ?? [])
    setLoadingOrders(false)
  }

  const fetchWishlist = async () => {
    if (!wishlistIds.length) { setWishlistProducts([]); return }
    setLoadingWishlist(true)
    const { data } = await supabase
      .from('products')
      .select(`*, images:product_images(url, is_primary)`)
      .in('id', wishlistIds)
      .eq('is_active', true)
    setWishlistProducts((data as Product[]) ?? [])
    setLoadingWishlist(false)
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await supabase.from('profiles').update(editForm).eq('id', user!.id)
    await fetchProfile(user!.id)
    setSaveMsg('Profile updated successfully.')
    setSaving(false)
    setTimeout(() => setSaveMsg(''), 3000)
  }

  const tabs = [
    { id: 'overview' as Tab, label: 'Overview', icon: User },
    { id: 'orders' as Tab, label: 'My Orders', icon: Package },
    { id: 'wishlist' as Tab, label: 'Wishlist', icon: Heart },
    { id: 'addresses' as Tab, label: 'Addresses', icon: MapPin },
    { id: 'settings' as Tab, label: 'Settings', icon: Settings },
  ]

  if (!user) return null

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email?.[0].toUpperCase() ?? '?'

  return (
    <div className="min-h-screen bg-background">
      <SEO title="My Account" description="Manage your Maison Luxe account, view orders, wishlist, and settings." />
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-sm p-6 sticky top-24">
              {/* User info */}
              <div className="flex items-center gap-3 mb-6">
                <Avatar className="size-12">
                  <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-sm">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{profile?.full_name ?? 'Welcome'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  {profile?.role !== 'customer' && (
                    <Badge variant="secondary" className="text-[10px] mt-0.5">{profile?.role}</Badge>
                  )}
                </div>
              </div>

              <Separator className="mb-4" />

              <nav className="flex flex-col gap-1">
                {tabs.map((t) => (
                  <Link
                    key={t.id}
                    to={`/account/${t.id}`}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-sm text-sm transition-colors',
                      activeTab === t.id
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    )}
                  >
                    <t.icon className="size-4 shrink-0" />
                    {t.label}
                    {activeTab !== t.id && <ChevronRight className="size-3 ml-auto opacity-50" />}
                  </Link>
                ))}
              </nav>

              <Separator className="my-4" />

              {(profile?.role === 'admin' || profile?.role === 'manager') && (
                <Link
                  to="/admin"
                  className="flex items-center gap-3 px-3 py-2 rounded-sm text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors mb-1"
                >
                  <Settings className="size-4" /> Admin Panel
                </Link>
              )}

              <button
                onClick={() => { void signOut(); navigate('/') }}
                className="flex items-center gap-3 px-3 py-2 rounded-sm text-sm text-destructive hover:bg-destructive/10 transition-colors w-full"
              >
                <LogOut className="size-4" /> Sign Out
              </button>

              {profile?.loyalty_points !== undefined && (
                <>
                  <Separator className="my-4" />
                  <div className="text-center bg-muted rounded-sm p-3">
                    <p className="text-xs text-muted-foreground">Loyalty Points</p>
                    <p className="font-serif text-2xl font-semibold text-foreground">
                      {profile.loyalty_points.toLocaleString()}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* OVERVIEW */}
              {activeTab === 'overview' && (
                <div>
                  <h1 className="font-serif text-3xl font-semibold mb-6">
                    Welcome back, {profile?.full_name?.split(' ')[0] ?? 'there'}
                  </h1>

                  {/* Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                    {[
                      { label: 'Total Orders', value: orders.length, icon: Package },
                      { label: 'Wishlist Items', value: wishlistIds.length, icon: Heart },
                      { label: 'Loyalty Points', value: profile?.loyalty_points ?? 0, icon: Star },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-card border border-border rounded-sm p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <stat.icon className="size-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{stat.label}</span>
                        </div>
                        <p className="font-serif text-2xl font-semibold">{stat.value.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>

                  {/* Recent orders */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-serif text-xl font-semibold">Recent Orders</h2>
                      <Link to="/account/orders" className="text-sm text-primary hover:underline">
                        View all
                      </Link>
                    </div>
                    <OrderList orders={orders} loading={loadingOrders} />
                  </div>
                </div>
              )}

              {/* ORDERS */}
              {activeTab === 'orders' && (
                <div>
                  <h1 className="font-serif text-3xl font-semibold mb-6">My Orders</h1>
                  <OrderList orders={orders} loading={loadingOrders} />
                </div>
              )}

              {/* WISHLIST */}
              {activeTab === 'wishlist' && (
                <div>
                  <h1 className="font-serif text-3xl font-semibold mb-6">
                    Wishlist <span className="text-muted-foreground text-xl">({wishlistIds.length})</span>
                  </h1>
                  {loadingWishlist ? (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-48 rounded-sm" />)}
                    </div>
                  ) : wishlistProducts.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground">
                      <Heart className="size-12 mx-auto mb-3 opacity-30" />
                      <p className="font-medium">Your wishlist is empty</p>
                      <Button className="mt-4" asChild><Link to="/products">Explore Products</Link></Button>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {wishlistProducts.map((p) => {
                        const img = p.images?.find((i) => i.is_primary)?.url ?? p.images?.[0]?.url
                        return (
                          <Link
                            key={p.id}
                            to={`/products/${p.slug}`}
                            className="group bg-card border border-border rounded-sm overflow-hidden hover:shadow-md transition-shadow"
                          >
                            <div className="aspect-square overflow-hidden bg-muted">
                              <img src={img ?? 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400'} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            </div>
                            <div className="p-3">
                              <p className="font-medium text-sm line-clamp-1">{p.name}</p>
                              <p className="text-muted-foreground text-sm mt-0.5">
                                Rs. {(p.sale_price ?? p.price).toLocaleString()}
                              </p>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ADDRESSES */}
              {activeTab === 'addresses' && (
                <div>
                  <h1 className="font-serif text-3xl font-semibold mb-6">Saved Addresses</h1>
                  <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-sm">
                    <MapPin className="size-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No saved addresses yet</p>
                    <p className="text-sm mt-1">Addresses saved during checkout will appear here</p>
                  </div>
                </div>
              )}

              {/* SETTINGS */}
              {activeTab === 'settings' && (
                <div>
                  <h1 className="font-serif text-3xl font-semibold mb-6">Account Settings</h1>

                  <div className="bg-card border border-border rounded-sm p-6 mb-6">
                    <h2 className="font-medium mb-4">Profile Information</h2>
                    <form onSubmit={(e) => void handleSaveProfile(e)} className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="full_name">Full Name</Label>
                        <Input
                          id="full_name"
                          value={editForm.full_name}
                          onChange={(e) => setEditForm((f) => ({ ...f, full_name: e.target.value }))}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="email_disp">Email</Label>
                        <Input id="email_disp" value={user.email ?? ''} disabled className="opacity-60" />
                        <p className="text-xs text-muted-foreground">Email cannot be changed here</p>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={editForm.phone}
                          onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                          placeholder="+92 300 0000000"
                        />
                      </div>
                      {saveMsg && <p className="text-sm text-green-600 bg-green-500/10 px-3 py-2 rounded-sm">{saveMsg}</p>}
                      <Button type="submit" className="w-fit" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </form>
                  </div>

                  <div className="bg-card border border-destructive/20 rounded-sm p-6">
                    <h2 className="font-medium mb-2 text-destructive">Danger Zone</h2>
                    <p className="text-sm text-muted-foreground mb-4">
                      Once you delete your account, all data will be permanently removed.
                    </p>
                    <Button variant="destructive" size="sm" disabled>
                      Delete Account
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

function OrderList({ orders, loading }: { orders: Order[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-sm" />)}
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-sm">
        <Package className="size-12 mx-auto mb-3 opacity-30" />
        <p className="font-medium">No orders yet</p>
        <Button className="mt-4" asChild><Link to="/products">Start Shopping</Link></Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {orders.map((order) => (
        <div key={order.id} className="bg-card border border-border rounded-sm p-4 hover:shadow-sm transition-shadow">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-sm font-semibold">{order.order_number}</span>
                <Badge className={cn('text-[10px] border', statusColors[order.status] ?? '')} variant="outline">
                  {statusIcons[order.status]}
                  <span className="ml-1 capitalize">{order.status}</span>
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(order.created_at).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })}
                {' · '}{order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold">Rs. {order.total_amount.toLocaleString()}</p>
              <Link
                to={`/order-confirmation/${order.id}`}
                className="text-xs text-primary hover:underline flex items-center gap-1 justify-end mt-1"
              >
                <Eye className="size-3" /> View Details
              </Link>
            </div>
          </div>

          {order.items && order.items.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {order.items.slice(0, 4).map((item) => (
                <div key={item.id} className="size-10 rounded-xs overflow-hidden bg-muted shrink-0">
                  <img
                    src={item.image_url || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=100'}
                    alt={item.product_name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              {(order.items.length ?? 0) > 4 && (
                <div className="size-10 rounded-xs bg-muted flex items-center justify-center text-xs text-muted-foreground shrink-0">
                  +{order.items.length - 4}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
