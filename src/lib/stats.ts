import { supabaseAdmin } from './supabaseAdmin'

type StatRow = { created_at: string }

async function dailyCountsFor(table: 'orders' | 'cart_items', filter?: { status?: string }): Promise<number[]> {
  const since = new Date()
  since.setDate(since.getDate() - 6)
  since.setHours(0, 0, 0, 0)

  let query = supabaseAdmin
    .from(table)
    .select('created_at')
    .gte('created_at', since.toISOString())

  if (filter?.status) query = query.eq('status', filter.status)

  const { data } = await query
  const buckets = Array(7).fill(0)

  for (const row of (data ?? []) as StatRow[]) {
    const d = new Date(row.created_at)
    d.setHours(0, 0, 0, 0)
    const dayIndex = Math.floor((d.getTime() - since.getTime()) / (24 * 60 * 60 * 1000))
    if (dayIndex >= 0 && dayIndex < 7) buckets[dayIndex]++
  }

  return buckets
}

export async function getDashboardStats() {
  const [pending, packed, shipped, activeCarts, pendingTrend, packedTrend, shippedTrend, cartTrend] = await Promise.all([
    supabaseAdmin.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabaseAdmin.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'packed'),
    supabaseAdmin.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'shipped'),
    supabaseAdmin.from('cart_items').select('user_id', { count: 'exact', head: true }),
    dailyCountsFor('orders', { status: 'pending' }),
    dailyCountsFor('orders', { status: 'packed' }),
    dailyCountsFor('orders', { status: 'shipped' }),
    dailyCountsFor('cart_items'),
  ])

  return {
    pending: { count: pending.count ?? 0, trend: pendingTrend },
    packed: { count: packed.count ?? 0, trend: packedTrend },
    shipped: { count: shipped.count ?? 0, trend: shippedTrend },
    carts: { count: activeCarts.count ?? 0, trend: cartTrend },
  }
}
