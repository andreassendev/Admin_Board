import { supabaseAdmin } from './supabaseAdmin'

const COUNTED_STATUSES = ['paid', 'packed', 'shipped', 'delivered']

type Order = {
  total_amount: number
  created_at: string
  id: string
}

type OrderItem = {
  order_id: string
  product_id: string
  unit_price: number
  quantity: number
}

type Product = {
  id: string
  cost_price: number | null
}

function startOf(unit: 'day' | 'week' | 'month'): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  if (unit === 'week') {
    const day = d.getDay()
    const diff = day === 0 ? 6 : day - 1
    d.setDate(d.getDate() - diff)
  } else if (unit === 'month') {
    d.setDate(1)
  }
  return d
}

export type RevenueStats = {
  revenueToday: number
  revenueThisWeek: number
  revenueThisMonth: number
  revenueAllTime: number
  profitThisMonth: number | null
  orderCountThisMonth: number
  avgOrderValueThisMonth: number
  dailyRevenue7d: number[]
  dailyProfit7d: number[] | null
}

export async function getRevenueStats(): Promise<RevenueStats> {
  const monthStart = startOf('month')
  const weekStart = startOf('week')
  const dayStart = startOf('day')
  const last7DaysStart = new Date(dayStart)
  last7DaysStart.setDate(last7DaysStart.getDate() - 6)

  const { data: orders } = await supabaseAdmin
    .from('orders')
    .select('total_amount, created_at, id')
    .in('status', COUNTED_STATUSES)

  const all = (orders ?? []) as Order[]

  const revenueAllTime = all.reduce((sum, o) => sum + (o.total_amount ?? 0), 0)
  const revenueThisMonth = all.filter(o => new Date(o.created_at) >= monthStart).reduce((sum, o) => sum + o.total_amount, 0)
  const revenueThisWeek = all.filter(o => new Date(o.created_at) >= weekStart).reduce((sum, o) => sum + o.total_amount, 0)
  const revenueToday = all.filter(o => new Date(o.created_at) >= dayStart).reduce((sum, o) => sum + o.total_amount, 0)

  const ordersThisMonth = all.filter(o => new Date(o.created_at) >= monthStart)
  const orderCountThisMonth = ordersThisMonth.length
  const avgOrderValueThisMonth = orderCountThisMonth > 0 ? revenueThisMonth / orderCountThisMonth : 0

  const last7DaysOrders = all.filter(o => new Date(o.created_at) >= last7DaysStart)
  const dailyRevenue7d = Array(7).fill(0)
  for (const order of last7DaysOrders) {
    const d = new Date(order.created_at)
    d.setHours(0, 0, 0, 0)
    const index = Math.floor((d.getTime() - last7DaysStart.getTime()) / (24 * 60 * 60 * 1000))
    if (index >= 0 && index < 7) dailyRevenue7d[index] += order.total_amount
  }

  let profitThisMonth: number | null = null
  let dailyProfit7d: number[] | null = null

  if (ordersThisMonth.length > 0) {
    const orderIds = ordersThisMonth.map(o => o.id)
    const { data: items } = await supabaseAdmin
      .from('order_items')
      .select('order_id, product_id, unit_price, quantity')
      .in('order_id', orderIds)

    const rawItems = (items ?? []) as OrderItem[]
    const productIds = Array.from(new Set(rawItems.map(it => it.product_id)))

    if (productIds.length > 0) {
      const { data: products } = await supabaseAdmin
        .from('products')
        .select('id, cost_price')
        .in('id', productIds)

      const hasCostData = (products ?? []).some((p: Product) => p.cost_price != null && p.cost_price > 0)

      if (hasCostData) {
        const costById = new Map<string, number>((products ?? []).map((p: Product) => [p.id, p.cost_price ?? 0]))
        let profit = 0
        const profitByDay = Array(7).fill(0)
        const orderDateById = new Map(ordersThisMonth.map(o => [o.id, new Date(o.created_at)]))

        for (const item of rawItems) {
          const cost = costById.get(item.product_id) ?? 0
          const itemProfit = (item.unit_price - cost) * item.quantity
          profit += itemProfit

          const orderDate = orderDateById.get(item.order_id)
          if (orderDate && orderDate >= last7DaysStart) {
            const d = new Date(orderDate)
            d.setHours(0, 0, 0, 0)
            const index = Math.floor((d.getTime() - last7DaysStart.getTime()) / (24 * 60 * 60 * 1000))
            if (index >= 0 && index < 7) profitByDay[index] += itemProfit
          }
        }

        profitThisMonth = profit
        dailyProfit7d = profitByDay
      }
    }
  }

  return {
    revenueToday,
    revenueThisWeek,
    revenueThisMonth,
    revenueAllTime,
    profitThisMonth,
    orderCountThisMonth,
    avgOrderValueThisMonth,
    dailyRevenue7d,
    dailyProfit7d,
  }
}
