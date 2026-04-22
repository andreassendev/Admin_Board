import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import type { OrderStatus } from '@/lib/types'

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Ventende',
  paid: 'Betalt',
  packed: 'Pakket',
  shipped: 'Sendt',
  delivered: 'Levert',
  cancelled: 'Avbrutt',
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-red-100 text-red-800',
  paid: 'bg-blue-100 text-blue-800',
  packed: 'bg-yellow-100 text-yellow-800',
  shipped: 'bg-green-100 text-green-800',
  delivered: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-gray-100 text-gray-500',
}

type OrderRow = {
  id: string
  status: OrderStatus
  total_amount: number
  created_at: string
  user_id: string
  shipping_address: { name?: string; city?: string } | null
}

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ status?: OrderStatus }> }) {
  const params = await searchParams
  const filter = params.status

  let query = supabaseAdmin
    .from('orders')
    .select('id, status, total_amount, created_at, user_id, shipping_address')
    .order('created_at', { ascending: false })
    .limit(100)

  if (filter) query = query.eq('status', filter)

  const { data: orders, error } = await query

  return (
    <main className="min-h-screen">
      <Header />
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Ordrer</h1>
          <Link href="/" className="text-sm text-gray-600 hover:text-blue-600">← Dashboard</Link>
        </div>

        <div className="flex gap-2 mb-4 flex-wrap">
          <FilterTab label="Alle" href="/orders" active={!filter} />
          {(Object.keys(STATUS_LABELS) as OrderStatus[]).map(s => (
            <FilterTab key={s} label={STATUS_LABELS[s]} href={`/orders?status=${s}`} active={filter === s} />
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
            <p className="text-red-800">Feil ved henting av ordrer: {error.message}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-600">
              <tr>
                <th className="px-4 py-3">Ordre-ID</th>
                <th className="px-4 py-3">Mottaker</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Beløp</th>
                <th className="px-4 py-3">Opprettet</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(orders ?? []).map((order: OrderRow) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">{order.id.slice(0, 8)}…</td>
                  <td className="px-4 py-3">
                    {order.shipping_address?.name ?? '—'}
                    {order.shipping_address?.city && (
                      <div className="text-xs text-gray-500">{order.shipping_address.city}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded-full ${STATUS_COLORS[order.status]}`}>
                      {STATUS_LABELS[order.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums font-semibold">
                    {order.total_amount.toLocaleString('nb-NO')} kr
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(order.created_at).toLocaleString('nb-NO', { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/orders/${order.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Åpne →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {(!orders || orders.length === 0) && !error && (
            <div className="p-8 text-center text-gray-500">Ingen ordrer med dette filteret</div>
          )}
        </div>
      </div>
    </main>
  )
}

function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-lg">ELgrossist · Admin Board</h1>
          <p className="text-xs text-gray-500">Intern admin for kontoret</p>
        </div>
        <nav className="flex gap-4 text-sm">
          <Link href="/" className="hover:text-blue-600">Dashboard</Link>
          <Link href="/orders" className="hover:text-blue-600 font-medium text-blue-600">Ordrer</Link>
          <Link href="/carts" className="hover:text-blue-600">Handlekurver</Link>
        </nav>
      </div>
    </header>
  )
}

function FilterTab({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
        active
          ? 'bg-blue-600 text-white border-blue-600'
          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
      }`}
    >
      {label}
    </Link>
  )
}
