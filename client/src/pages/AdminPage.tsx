import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { SEO } from '@/components/SEO'
import { motion } from 'framer-motion'
import {
  BarChart3, Package, ShoppingCart, Users, TrendingUp, TrendingDown,
  AlertTriangle, CheckCircle2, Clock, Truck, XCircle,
  DollarSign, Eye, RefreshCw, Search
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
} from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { useAuthStore } from '@/store/useAuthStore'
import { supabase, type Order, type Product } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import { unparse } from 'papaparse'
import { FileText, FileSpreadsheet, Filter } from 'lucide-react'
import { toast } from 'sonner'

type AdminTab = 'dashboard' | 'orders' | 'products' | 'customers' | 'reports'

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  processing: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  shipped: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/30',
  delivered: 'bg-green-500/10 text-green-600 border-green-500/30',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/30',
}

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="size-3" />,
  processing: <Package className="size-3" />,
  shipped: <Truck className="size-3" />,
  delivered: <CheckCircle2 className="size-3" />,
  cancelled: <XCircle className="size-3" />,
}

const chartConfig = {
  revenue: { label: 'Revenue', color: 'var(--chart-1)' },
  orders: { label: 'Orders', color: 'var(--chart-2)' },
}

export function AdminPage() {
  const { tab = 'dashboard' } = useParams<{ tab?: AdminTab }>()
  const activeTab = tab as AdminTab
  const navigate = useNavigate()
  const { user, profile } = useAuthStore()

  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
  })
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [chartData, setChartData] = useState<{ name: string; revenue: number; orders: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [orderSearch, setOrderSearch] = useState('')
  const [orderStatusFilter, setOrderStatusFilter] = useState('all')
  const [productSearch, setProductSearch] = useState('')
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)
  const [reportDateRange, setReportDateRange] = useState<'7d' | '30d' | '90d' | '1y' | 'all'>('all')
  const [reportMetric, setReportMetric] = useState<'revenue' | 'orders' | 'products'>('revenue')
  const [reportData, setReportData] = useState<any[]>([])
  const [reportLoading, setReportLoading] = useState(false)

  useEffect(() => {
    if (!user || (profile && profile.role === 'customer')) {
      navigate('/')
    }
  }, [user, profile])

  useEffect(() => {
    void loadData()
  }, [activeTab])

  // Real-time subscription for new orders
  useEffect(() => {
    const channel = supabase
      .channel('admin-realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => { void loadData() }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => { void loadData() }
      )
      .subscribe()

    return () => { void supabase.removeChannel(channel) }
  }, [activeTab])

  const loadData = useCallback(async () => {
    setLoading(true)
    await Promise.all([
      fetchStats(),
      activeTab === 'dashboard' || activeTab === 'orders' ? fetchOrders() : Promise.resolve(),
      activeTab === 'dashboard' || activeTab === 'products' ? fetchProducts() : Promise.resolve(),
      activeTab === 'dashboard' ? buildChartData() : Promise.resolve(),
    ])
    setLoading(false)
  }, [activeTab])

  const fetchStats = async () => {
    const [ordersRes, productsRes, profilesRes] = await Promise.all([
      supabase.from('orders').select('total_amount, status'),
      supabase.from('products').select('id, stock_quantity, low_stock_threshold, is_active'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'customer'),
    ])

    const orders = ordersRes.data ?? []
    const prods = productsRes.data ?? []

    setStats({
      totalRevenue: orders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + (o.total_amount ?? 0), 0),
      totalOrders: orders.length,
      totalProducts: prods.filter((p) => p.is_active).length,
      totalCustomers: profilesRes.count ?? 0,
      pendingOrders: orders.filter((o) => o.status === 'pending').length,
      lowStockProducts: prods.filter((p) => p.is_active && p.stock_quantity <= p.low_stock_threshold).length,
    })
  }

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select(`*, items:order_items(id, product_name, quantity, image_url)`)
      .order('created_at', { ascending: false })
      .limit(50)
    setRecentOrders((data as Order[]) ?? [])
  }

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select(`*, images:product_images(url, is_primary)`)
      .order('created_at', { ascending: false })
      .limit(50)
    setProducts((data as Product[]) ?? [])
  }

  const buildChartData = async () => {
    const { data } = await supabase
      .from('orders')
      .select('created_at, total_amount, status')
      .neq('status', 'cancelled')
      .order('created_at', { ascending: true })

    const monthMap: Record<string, { revenue: number; orders: number }> = {}
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    ;(data ?? []).forEach((o) => {
      const date = new Date(o.created_at)
      const key = months[date.getMonth()]
      if (!monthMap[key]) monthMap[key] = { revenue: 0, orders: 0 }
      monthMap[key].revenue += o.total_amount ?? 0
      monthMap[key].orders += 1
    })

    const last6 = months.slice(Math.max(0, new Date().getMonth() - 5), new Date().getMonth() + 1)
    setChartData(last6.map((m) => ({ name: m, revenue: monthMap[m]?.revenue ?? 0, orders: monthMap[m]?.orders ?? 0 })))
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    setUpdatingOrderId(orderId)
    await supabase.from('orders').update({ status }).eq('id', orderId)
    setRecentOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: status as Order['status'] } : o))
    setUpdatingOrderId(null)
  }

  const toggleProductActive = async (productId: string, isActive: boolean) => {
    await supabase.from('products').update({ is_active: !isActive }).eq('id', productId)
    setProducts((prev) => prev.map((p) => p.id === productId ? { ...p, is_active: !isActive } : p))
  }

  const filteredOrders = recentOrders.filter((o) => {
    const matchesSearch = orderSearch === '' ||
      o.order_number?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      (o.shipping_address?.full_name ?? '').toLowerCase().includes(orderSearch.toLowerCase())
    const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter
    return matchesSearch && matchesStatus
  })

  const filteredProducts = products.filter((p) =>
    productSearch === '' || p.name.toLowerCase().includes(productSearch.toLowerCase())
  )

  const buildReport = async () => {
    setReportLoading(true)
    const now = new Date()
    let startDate: Date | null = null
    switch (reportDateRange) {
      case '7d': startDate = new Date(now.getTime() - 7 * 86400000); break
      case '30d': startDate = new Date(now.getTime() - 30 * 86400000); break
      case '90d': startDate = new Date(now.getTime() - 90 * 86400000); break
      case '1y': startDate = new Date(now.getTime() - 365 * 86400000); break
    }

    let query = supabase
      .from('orders')
      .select('created_at, total_amount, status, payment_method, shipping_address')
      .neq('status', 'cancelled')

    if (startDate) query = query.gte('created_at', startDate.toISOString())
    query = query.order('created_at', { ascending: false }).limit(500)

    const { data } = await query
    setReportData(data ?? [])
    setReportLoading(false)
  }

  const exportCSV = () => {
    let data: any[] = []
    let filename = ''

    if (activeTab === 'orders' || activeTab === 'dashboard') {
      data = filteredOrders.map((o) => ({
        'Order #': o.order_number,
        Customer: (o.shipping_address as any)?.full_name ?? '',
        Date: new Date(o.created_at).toLocaleDateString(),
        Total: o.total_amount,
        Status: o.status,
        Payment: o.payment_method,
      }))
      filename = 'orders-export.csv'
    } else if (activeTab === 'products') {
      data = filteredProducts.map((p) => ({
        Name: p.name,
        SKU: p.sku,
        Price: p.price,
        Sale_Price: p.sale_price ?? '',
        Stock: p.stock_quantity,
        Status: p.is_active ? 'Active' : 'Inactive',
        Featured: p.is_featured ? 'Yes' : 'No',
      }))
      filename = 'products-export.csv'
    } else if (activeTab === 'customers') {
      filename = 'customers-export.csv'
      toast.error('Customer export coming soon')
      return
    } else if (activeTab === 'reports') {
      data = reportData.map((r: any) => ({
        Date: new Date(r.created_at).toLocaleDateString(),
        Amount: r.total_amount,
        Status: r.status,
        Payment: r.payment_method,
        Customer: (r.shipping_address as any)?.full_name ?? '',
      }))
      filename = 'report-export.csv'
    }

    if (data.length === 0) { toast.error('No data to export'); return }

    const csv = unparse({ fields: Object.keys(data[0]), data: data.map((r) => Object.values(r)) })
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = filename; a.click()
    URL.revokeObjectURL(url)
    toast.success(`${filename} downloaded`)
  }

  const exportPDF = () => {
    let rows: any[][] = []
    let headers: string[] = []
    let title = ''

    if (activeTab === 'orders' || activeTab === 'dashboard') {
      headers = ['Order #', 'Customer', 'Date', 'Total', 'Status']
      rows = filteredOrders.map((o) => [
        o.order_number,
        (o.shipping_address as any)?.full_name ?? '',
        new Date(o.created_at).toLocaleDateString(),
        `Rs. ${o.total_amount.toLocaleString()}`,
        o.status,
      ])
      title = 'Orders Export'
    } else if (activeTab === 'products') {
      headers = ['Product', 'SKU', 'Price', 'Stock', 'Status']
      rows = filteredProducts.map((p) => [
        p.name,
        p.sku,
        `Rs. ${(p.sale_price ?? p.price).toLocaleString()}`,
        p.stock_quantity,
        p.is_active ? 'Active' : 'Inactive',
      ])
      title = 'Products Export'
    } else if (activeTab === 'customers') {
      toast.error('Customer PDF export coming soon')
      return
    } else if (activeTab === 'reports') {
      headers = ['Date', 'Amount', 'Status', 'Payment', 'Customer']
      rows = reportData.map((r: any) => [
        new Date(r.created_at).toLocaleDateString(),
        `Rs. ${(r.total_amount ?? 0).toLocaleString()}`,
        r.status,
        r.payment_method,
        (r.shipping_address as any)?.full_name ?? '',
      ])
      title = 'Report Export'
    }

    if (rows.length === 0) { toast.error('No data to export'); return }

    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text(title, 14, 20)
    doc.setFontSize(10)
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28)
    ;(doc as any).autoTable({
      head: [headers],
      body: rows,
      startY: 34,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] },
    })
    doc.save(`${title.toLowerCase().replace(/\s+/g, '-')}.pdf`)
    toast.success('PDF downloaded')
  }

  const adminTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'reports', label: 'Reports', icon: FileText },
  ]

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Admin Panel" description="Maison Luxe admin dashboard for managing orders, products, and customers." />
      {/* Admin header */}
      <div className="border-b border-border bg-card sticky top-0 z-20">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-4">
            <Link to="/" className="font-serif text-lg font-semibold text-foreground">Maison Luxe</Link>
            <Separator orientation="vertical" className="h-5" />
            <span className="text-sm text-muted-foreground font-medium">Admin Panel</span>
            <span className="flex items-center gap-1 text-[10px] text-green-600 bg-green-500/10 px-1.5 py-0.5 rounded"><span className="size-1.5 rounded-full bg-green-600 animate-pulse" />Live</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="size-8" onClick={() => void loadData()}>
              <RefreshCw className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" className="size-8" onClick={exportCSV} title="Export CSV">
              <FileSpreadsheet className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" className="size-8" onClick={exportPDF} title="Export PDF">
              <FileText className="size-4" />
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/">View Store</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6">
        {/* Tab navigation */}
        <div className="flex gap-1 mb-6 bg-muted p-1 rounded-sm w-fit">
          {adminTabs.map((t) => (
            <Link
              key={t.id}
              to={`/admin/${t.id}`}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-xs text-sm transition-colors',
                activeTab === t.id
                  ? 'bg-background text-foreground shadow-xs font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <t.icon className="size-4" />
              <span className="hidden sm:inline">{t.label}</span>
            </Link>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-sm" />)}
          </div>
        ) : (
          <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div className="flex flex-col gap-6">
                {/* Stats grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Revenue', value: `Rs. ${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, trend: 12, color: 'text-green-600' },
                    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingCart, trend: 8, color: 'text-blue-600' },
                    { label: 'Products', value: stats.totalProducts, icon: Package, trend: 0, color: 'text-foreground' },
                    { label: 'Customers', value: stats.totalCustomers, icon: Users, trend: 5, color: 'text-foreground' },
                  ].map((s) => (
                    <div key={s.label} className="bg-card border border-border rounded-sm p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-muted-foreground font-medium">{s.label}</span>
                        <s.icon className={cn('size-4', s.color)} />
                      </div>
                      <p className="font-serif text-2xl font-semibold">{s.value}</p>
                      {s.trend !== 0 && (
                        <div className={`flex items-center gap-1 mt-1 text-xs ${s.trend > 0 ? 'text-green-600' : 'text-destructive'}`}>
                          {s.trend > 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                          <span>{Math.abs(s.trend)}% this month</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Alerts */}
                {(stats.pendingOrders > 0 || stats.lowStockProducts > 0) && (
                  <div className="flex flex-wrap gap-3">
                    {stats.pendingOrders > 0 && (
                      <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-sm px-4 py-2 text-sm text-amber-700 dark:text-amber-400">
                        <Clock className="size-4" />
                        <span>{stats.pendingOrders} pending order{stats.pendingOrders !== 1 ? 's' : ''} awaiting action</span>
                        <Link to="/admin/orders" className="underline ml-1 font-medium">View</Link>
                      </div>
                    )}
                    {stats.lowStockProducts > 0 && (
                      <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 rounded-sm px-4 py-2 text-sm text-destructive">
                        <AlertTriangle className="size-4" />
                        <span>{stats.lowStockProducts} product{stats.lowStockProducts !== 1 ? 's' : ''} running low on stock</span>
                        <Link to="/admin/products" className="underline ml-1 font-medium">View</Link>
                      </div>
                    )}
                  </div>
                )}

                {/* Revenue chart */}
                {chartData.length > 0 && (
                  <div className="bg-card border border-border rounded-sm p-6">
                    <h2 className="font-serif text-lg font-semibold mb-4">Revenue Overview</h2>
                    <ChartContainer config={chartConfig} className="h-60">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="name" className="text-xs fill-muted-foreground" tick={{ fontSize: 12 }} />
                        <YAxis className="text-xs fill-muted-foreground" tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                  </div>
                )}

                {/* Recent orders */}
                <div className="bg-card border border-border rounded-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-serif text-lg font-semibold">Recent Orders</h2>
                    <Link to="/admin/orders" className="text-sm text-primary hover:underline">View all</Link>
                  </div>
                  <AdminOrderTable orders={recentOrders.slice(0, 5)} onUpdateStatus={updateOrderStatus} updatingId={updatingOrderId} compact />
                </div>
              </div>
            )}

            {/* ORDERS */}
            {activeTab === 'orders' && (
              <div>
                <h1 className="font-serif text-2xl font-semibold mb-5">Orders</h1>
                <div className="flex flex-wrap gap-3 mb-4">
                  <div className="relative flex-1 min-w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by order # or customer..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
                        <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <AdminOrderTable orders={filteredOrders} onUpdateStatus={updateOrderStatus} updatingId={updatingOrderId} />
              </div>
            )}

            {/* PRODUCTS */}
            {activeTab === 'products' && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h1 className="font-serif text-2xl font-semibold">Products</h1>
                  <Badge variant="outline" className="text-sm">{products.length} total</Badge>
                </div>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="pl-9 max-w-sm"
                  />
                </div>
                <div className="bg-card border border-border rounded-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b border-border bg-muted/40">
                        <tr>
                          {['Product', 'SKU', 'Price', 'Stock', 'Status', 'Actions'].map((h) => (
                            <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map((p) => {
                          const img = p.images?.find((i) => i.is_primary)?.url ?? p.images?.[0]?.url
                          const isLow = p.stock_quantity <= p.low_stock_threshold
                          return (
                            <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="size-10 rounded-xs overflow-hidden bg-muted shrink-0">
                                    <img src={img ?? 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=80'} alt={p.name} className="w-full h-full object-cover" />
                                  </div>
                                  <div>
                                    <p className="font-medium line-clamp-1 max-w-48">{p.name}</p>
                                    {p.is_featured && <Badge variant="secondary" className="text-[10px] mt-0.5">Featured</Badge>}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.sku}</td>
                              <td className="px-4 py-3 font-medium">
                                Rs. {(p.sale_price ?? p.price).toLocaleString()}
                                {p.sale_price && <span className="text-xs text-muted-foreground line-through ml-1">Rs. {p.price.toLocaleString()}</span>}
                              </td>
                              <td className="px-4 py-3">
                                <span className={cn('font-medium', isLow ? 'text-destructive' : '')}>
                                  {p.stock_quantity}
                                </span>
                                {isLow && <AlertTriangle className="inline size-3 ml-1 text-amber-500" />}
                              </td>
                              <td className="px-4 py-3">
                                <Badge className={cn('text-[10px] border', p.is_active ? 'bg-green-500/10 text-green-600 border-green-500/30' : 'bg-muted text-muted-foreground border-border')} variant="outline">
                                  {p.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1">
                                  <Button variant="ghost" size="icon" className="size-7" asChild>
                                    <Link to={`/products/${p.slug}`}><Eye className="size-3.5" /></Link>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={() => void toggleProductActive(p.id, p.is_active)}
                                  >
                                    {p.is_active ? 'Deactivate' : 'Activate'}
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* CUSTOMERS */}
            {activeTab === 'customers' && (
              <div>
                <h1 className="font-serif text-2xl font-semibold mb-5">Customers</h1>
                <CustomersList />
              </div>
            )}

            {/* REPORTS */}
            {activeTab === 'reports' && (
              <div>
                <h1 className="font-serif text-2xl font-semibold mb-5">Reports</h1>
                <div className="bg-card border border-border rounded-sm p-6 mb-6">
                  <h2 className="font-semibold mb-4">Build a Custom Report</h2>
                  <div className="flex flex-wrap gap-4 mb-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-muted-foreground">Metric</label>
                      <Select value={reportMetric} onValueChange={(v: any) => setReportMetric(v)}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="revenue">Revenue</SelectItem>
                          <SelectItem value="orders">Orders</SelectItem>
                          <SelectItem value="products">Products</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-muted-foreground">Date Range</label>
                      <Select value={reportDateRange} onValueChange={(v: any) => setReportDateRange(v)}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7d">Last 7 Days</SelectItem>
                          <SelectItem value="30d">Last 30 Days</SelectItem>
                          <SelectItem value="90d">Last 90 Days</SelectItem>
                          <SelectItem value="1y">Last Year</SelectItem>
                          <SelectItem value="all">All Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button onClick={() => void buildReport()} disabled={reportLoading} className="gap-2">
                        <Filter className="size-4" />
                        {reportLoading ? 'Generating...' : 'Generate Report'}
                      </Button>
                    </div>
                  </div>

                  {reportData.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm text-muted-foreground">
                          {reportData.length} records found
                        </p>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="gap-1.5" onClick={exportCSV}>
                            <FileSpreadsheet className="size-3.5" /> CSV
                          </Button>
                          <Button variant="outline" size="sm" className="gap-1.5" onClick={exportPDF}>
                            <FileText className="size-3.5" /> PDF
                          </Button>
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="border-b border-border bg-muted/40">
                            <tr>
                              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Date</th>
                              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Amount</th>
                              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Status</th>
                              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Payment</th>
                              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Customer</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reportData.slice(0, 50).map((r: any, i: number) => (
                              <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30">
                                <td className="px-4 py-3 text-xs text-muted-foreground">
                                  {new Date(r.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3 font-medium">Rs. {(r.total_amount ?? 0).toLocaleString()}</td>
                                <td className="px-4 py-3">
                                  <Badge className={cn('text-[10px] border', statusColors[r.status] ?? '')} variant="outline">
                                    {r.status}
                                  </Badge>
                                </td>
                                <td className="px-4 py-3 text-xs text-muted-foreground capitalize">
                                  {r.payment_method?.replace('_', ' ')}
                                </td>
                                <td className="px-4 py-3 text-xs max-w-32 truncate">
                                  {(r.shipping_address as any)?.full_name ?? '—'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}

function AdminOrderTable({
  orders,
  onUpdateStatus,
  updatingId,
  compact = false,
}: {
  orders: Order[]
  onUpdateStatus: (id: string, status: string) => Promise<void>
  updatingId: string | null
  compact?: boolean
}) {
  if (orders.length === 0) {
    return <p className="text-center text-muted-foreground py-8 text-sm">No orders found</p>
  }

  return (
    <div className={cn('overflow-x-auto', !compact && 'bg-card border border-border rounded-sm')}>
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-muted/40">
          <tr>
            {['Order #', 'Customer', 'Date', 'Total', 'Payment', 'Status', 'Update'].map((h) => (
              <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
              <td className="px-4 py-3">
                <Link to={`/order-confirmation/${order.id}`} className="font-mono text-xs font-semibold text-primary hover:underline">
                  {order.order_number}
                </Link>
              </td>
              <td className="px-4 py-3 text-sm max-w-32 truncate">
                {order.shipping_address?.full_name ?? '—'}
              </td>
              <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                {new Date(order.created_at).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })}
              </td>
              <td className="px-4 py-3 font-semibold whitespace-nowrap">
                Rs. {order.total_amount.toLocaleString()}
              </td>
              <td className="px-4 py-3 text-xs text-muted-foreground capitalize">
                {order.payment_method?.replace('_', ' ')}
              </td>
              <td className="px-4 py-3">
                <Badge className={cn('text-[10px] border flex w-fit items-center gap-1', statusColors[order.status] ?? '')} variant="outline">
                  {statusIcons[order.status]}
                  <span className="capitalize">{order.status}</span>
                </Badge>
              </td>
              <td className="px-4 py-3">
                {updatingId === order.id ? (
                  <span className="text-xs text-muted-foreground">Updating...</span>
                ) : (
                  <Select
                    value={order.status}
                    onValueChange={(val) => void onUpdateStatus(order.id, val)}
                  >
                    <SelectTrigger className="h-7 text-xs w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
                        <SelectItem key={s} value={s} className="text-xs capitalize">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CustomersList() {
  const [customers, setCustomers] = useState<{ id: string; full_name: string; phone: string; created_at: string; loyalty_points: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, phone, created_at, loyalty_points')
        .eq('role', 'customer')
        .order('created_at', { ascending: false })
        .limit(50)
      setCustomers(data ?? [])
      setLoading(false)
    }
    void fetch()
  }, [])

  if (loading) return <div className="flex flex-col gap-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 rounded-sm" />)}</div>

  if (customers.length === 0) {
    return <p className="text-center text-muted-foreground py-8 text-sm">No customers yet</p>
  }

  return (
    <div className="bg-card border border-border rounded-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-muted/40">
          <tr>
            {['Name', 'Phone', 'Joined', 'Loyalty Points'].map((h) => (
              <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
              <td className="px-4 py-3 font-medium">{c.full_name || 'No name'}</td>
              <td className="px-4 py-3 text-muted-foreground">{c.phone || '—'}</td>
              <td className="px-4 py-3 text-xs text-muted-foreground">
                {new Date(c.created_at).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' })}
              </td>
              <td className="px-4 py-3 font-medium">{c.loyalty_points?.toLocaleString() ?? 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
