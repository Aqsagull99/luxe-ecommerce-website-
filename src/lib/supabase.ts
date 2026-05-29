import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Profile = {
  id: string
  full_name: string
  phone: string
  avatar_url: string
  role: 'customer' | 'manager' | 'admin'
  loyalty_points: number
  created_at: string
  updated_at: string
}

export type Category = {
  id: string
  name: string
  slug: string
  description: string
  image_url: string
  parent_id: string | null
  sort_order: number
  is_active: boolean
}

export type Product = {
  id: string
  name: string
  slug: string
  description: string
  short_description: string
  category_id: string
  price: number
  sale_price: number | null
  cost_price: number
  sku: string
  stock_quantity: number
  low_stock_threshold: number
  tags: string[]
  is_active: boolean
  is_featured: boolean
  is_new_arrival: boolean
  is_best_seller: boolean
  rating_avg: number
  rating_count: number
  meta_title: string
  meta_description: string
  created_at: string
  updated_at: string
  category?: Category
  images?: ProductImage[]
  variants?: ProductVariant[]
}

export type ProductImage = {
  id: string
  product_id: string
  url: string
  alt_text: string
  sort_order: number
  is_primary: boolean
}

export type ProductVariant = {
  id: string
  product_id: string
  name: string
  sku: string
  price_modifier: number
  stock_quantity: number
  color: string
  size: string
  material: string
  finish: string
  image_url: string
  is_active: boolean
}

export type Review = {
  id: string
  product_id: string
  user_id: string
  rating: number
  title: string
  body: string
  is_verified_purchase: boolean
  is_approved: boolean
  helpful_count: number
  created_at: string
  profile?: { full_name: string; avatar_url: string }
}

export type Order = {
  id: string
  order_number: string
  user_id: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned' | 'refunded'
  subtotal: number
  discount_amount: number
  shipping_amount: number
  tax_amount: number
  total_amount: number
  coupon_code: string
  shipping_address: Address
  payment_method: 'easypaisa' | 'jazzcash' | 'bank_transfer' | 'cod'
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  notes: string
  tracking_number: string
  estimated_delivery: string
  created_at: string
  updated_at: string
  items?: OrderItem[]
}

export type OrderItem = {
  id: string
  order_id: string
  product_id: string
  variant_id: string | null
  product_name: string
  variant_name: string
  quantity: number
  unit_price: number
  total_price: number
  image_url: string
}

export type Address = {
  id?: string
  user_id?: string
  label?: string
  full_name: string
  phone: string
  address_line1: string
  address_line2?: string
  city: string
  state?: string
  postal_code?: string
  country: string
  is_default?: boolean
}

export type CartItem = {
  id: string
  user_id: string
  product_id: string
  variant_id: string | null
  quantity: number
  product?: Product
  variant?: ProductVariant
}

export type Coupon = {
  id: string
  code: string
  type: 'percentage' | 'fixed' | 'free_shipping'
  value: number
  min_order_amount: number
  max_uses: number | null
  used_count: number
  is_active: boolean
  expires_at: string | null
}
