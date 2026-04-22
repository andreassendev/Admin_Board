import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import type { OrderStatus } from '@/lib/types'
import { StatusActions } from './StatusActions'

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Ventende',
  paid: 'Betalt',
  packed: 'Pakket',
  shipped: 'Sendt',
  delivered: 'Levert',
  cancelled: 'Avbrutt',
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-red-100 text-red-800 border-red-200',
  paid: 'bg-blue-100 text-blue-800 border-blue-200',
  packed: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  shipped: 'bg-green-100 text-green-800 border-green-200',
  delivered: 'bg-gray-100 text-gray-800 border-gray-200',
  cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', id)
    .single()

  if (error || !order) {
    notFound()
  }

  const shipping = order.shipping_address ?? {}
  const items = order.order_items ?? []
  const itemsTotal = items.reduce((sum: number, it: { unit_price: number; quantity: number }) => sum + it.unit_price * it.quantity, 0)

  return (
    <main className="min-h-screen">
      <Header />
      <div className="max-w-5xl mx-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/orders" className="text-sm text-gray-600 hover:text-blue-600">← Alle ordrer</Link>
            <h1 className="text-3xl font-bold mt-1">Ordre {order.id.slice(0, 8)}…</h1>
          </div>
          <span className={`inline-flex items-center px-3 py-1 text-sm rounded-full border ${STATUS_COLORS[order.status as OrderStatus]}`}>
            {STATUS_LABELS[order.status as OrderStatus]}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="md:col-span-2 bg-white rounded-lg shadow p-6">
            <h2 className="font-semibold text-lg mb-4">Produkter</h2>
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-gray-600 border-b">
                <tr>
                  <th className="pb-2">Produkt</th>
                  <th className="pb-2 text-right">Antall</th>
                  <th className="pb-2 text-right">Pris</th>
                  <th className="pb-2 text-right">Sum</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((item: { id: string; product_name: string; product_sku: string | null; quantity: number; unit_price: number }) => (
                  <tr key={item.id}>
                    <td className="py-2">
                      <div className="font-medium">{item.product_name}</div>
                      {item.product_sku && <div className="text-xs text-gray-500">{item.product_sku}</div>}
                    </td>
                    <td className="py-2 text-right">{item.quantity}</td>
                    <td className="py-2 text-right">{item.unit_price.toLocaleString('nb-NO')} kr</td>
                    <td className="py-2 text-right font-semibold">
                      {(item.unit_price * item.quantity).toLocaleString('nb-NO')} kr
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t">
                <tr>
                  <td colSpan={3} className="pt-3 text-right text-gray-600">Varesum:</td>
                  <td className="pt-3 text-right font-semibold">{itemsTotal.toLocaleString('nb-NO')} kr</td>
                </tr>
                <tr>
                  <td colSpan={3} className="pt-1 text-right text-gray-600">Frakt:</td>
                  <td className="pt-1 text-right">{(order.total_amount - itemsTotal).toLocaleString('nb-NO')} kr</td>
                </tr>
                <tr>
                  <td colSpan={3} className="pt-2 text-right font-bold">Totalt:</td>
                  <td className="pt-2 text-right font-bold text-lg">{order.total_amount.toLocaleString('nb-NO')} kr</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="font-semibold text-lg mb-3">Leveringsadresse</h2>
              <div className="text-sm space-y-1">
                <div className="font-medium">{shipping.name ?? '—'}</div>
                <div>{shipping.street ?? ''}</div>
                <div>{shipping.postal_code ?? ''} {shipping.city ?? ''}</div>
                <div>{shipping.country ?? ''}</div>
                {shipping.phone && <div className="text-gray-600 mt-2">Tlf: {shipping.phone}</div>}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="font-semibold text-lg mb-3">Tidslinje</h2>
              <div className="text-sm space-y-2">
                <div>
                  <span className="text-gray-600">Opprettet:</span>{' '}
                  <span className="font-medium">{new Date(order.created_at).toLocaleString('nb-NO')}</span>
                </div>
                <div>
                  <span className="text-gray-600">Sist endret:</span>{' '}
                  <span className="font-medium">{new Date(order.updated_at).toLocaleString('nb-NO')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold text-lg mb-4">Handlinger</h2>
          <StatusActions orderId={order.id} currentStatus={order.status as OrderStatus} />
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
          <Link href="/orders" className="hover:text-blue-600 text-blue-600 font-medium">Ordrer</Link>
          <Link href="/carts" className="hover:text-blue-600">Handlekurver</Link>
        </nav>
      </div>
    </header>
  )
}
