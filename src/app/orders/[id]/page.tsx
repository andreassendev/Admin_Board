import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, MapPin, Calendar } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { StatusBadge } from '@/components/StatusBadge'
import type { OrderStatus } from '@/lib/types'
import { StatusActions } from './StatusActions'

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
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <Link href="/orders" className="inline-flex items-center gap-1 text-xs text-muted hover:text-white transition-colors">
          <ArrowLeft className="h-3 w-3" />
          Alle ordrer
        </Link>
        <div className="flex items-center justify-between mt-2">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Ordre {order.id.slice(0, 8)}</h1>
            <p className="text-xs text-subtle mt-0.5 font-mono">{order.id}</p>
          </div>
          <StatusBadge status={order.status as OrderStatus} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 panel p-5">
          <h2 className="font-semibold text-sm mb-4">Produkter</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-subtle border-b">
                <th className="pb-2 font-medium">Produkt</th>
                <th className="pb-2 font-medium text-right">Antall</th>
                <th className="pb-2 font-medium text-right">Pris</th>
                <th className="pb-2 font-medium text-right">Sum</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((item: { id: string; product_name: string; product_sku: string | null; quantity: number; unit_price: number }) => (
                <tr key={item.id}>
                  <td className="py-2.5">
                    <div className="font-medium">{item.product_name}</div>
                    {item.product_sku && <div className="text-[11px] text-subtle font-mono">{item.product_sku}</div>}
                  </td>
                  <td className="py-2.5 text-right text-muted">{item.quantity}</td>
                  <td className="py-2.5 text-right text-muted tabular-nums">{item.unit_price.toLocaleString('nb-NO')} kr</td>
                  <td className="py-2.5 text-right tabular-nums font-medium">
                    {(item.unit_price * item.quantity).toLocaleString('nb-NO')} kr
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t">
              <tr>
                <td colSpan={3} className="pt-3 text-right text-xs text-muted">Varesum</td>
                <td className="pt-3 text-right tabular-nums">{itemsTotal.toLocaleString('nb-NO')} kr</td>
              </tr>
              <tr>
                <td colSpan={3} className="pt-1 text-right text-xs text-muted">Frakt</td>
                <td className="pt-1 text-right tabular-nums text-muted">{(order.total_amount - itemsTotal).toLocaleString('nb-NO')} kr</td>
              </tr>
              <tr>
                <td colSpan={3} className="pt-2 text-right text-sm font-semibold">Totalt</td>
                <td className="pt-2 text-right tabular-nums text-lg font-semibold">{order.total_amount.toLocaleString('nb-NO')} kr</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="space-y-4">
          <div className="panel p-5">
            <h2 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-subtle" />
              Leveringsadresse
            </h2>
            <div className="text-sm space-y-0.5 text-muted">
              <div className="font-medium text-white">{shipping.name ?? '—'}</div>
              {shipping.street && <div>{shipping.street}</div>}
              {(shipping.postal_code || shipping.city) && (
                <div>{shipping.postal_code} {shipping.city}</div>
              )}
              {shipping.country && <div>{shipping.country}</div>}
              {shipping.phone && <div className="text-subtle text-xs mt-2">Tlf: {shipping.phone}</div>}
            </div>
          </div>

          <div className="panel p-5">
            <h2 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-subtle" />
              Tidslinje
            </h2>
            <div className="text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted">Opprettet</span>
                <span>{new Date(order.created_at).toLocaleString('nb-NO')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Sist endret</span>
                <span>{new Date(order.updated_at).toLocaleString('nb-NO')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="panel p-5">
        <h2 className="font-semibold text-sm mb-4">Handlinger</h2>
        <StatusActions orderId={order.id} currentStatus={order.status as OrderStatus} />
      </div>
    </div>
  )
}
