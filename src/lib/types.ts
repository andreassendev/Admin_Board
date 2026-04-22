export type OrderStatus = 'pending' | 'paid' | 'packed' | 'shipped' | 'delivered' | 'cancelled'

export type Order = {
  id: string
  user_id: string
  status: OrderStatus
  total_amount: number
  shipping_address: ShippingAddress | null
  billing_address: ShippingAddress | null
  created_at: string
  updated_at: string
}

export type ShippingAddress = {
  name?: string
  street?: string
  postal_code?: string
  city?: string
  country?: string
  phone?: string
}

export type OrderItem = {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  product_name: string
  product_sku: string | null
}

export type OrderWithItems = Order & {
  items: OrderItem[]
  customer_email?: string
  customer_name?: string
}

export type CartItem = {
  id: string
  user_id: string
  product_id: string
  quantity: number
  created_at: string
  updated_at: string
}
