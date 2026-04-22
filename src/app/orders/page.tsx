import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { StatusBadge } from '@/components/StatusBadge'
import type { OrderStatus } from '@/lib/types'

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Ventende',
  paid: 'Betalt',
  packed: 'Pakket',
  shipped: 'Sendt',
  delivered: 'Levert',
  cancelled: 'Avbrutt',
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
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Ordrer</h1>
        <p className="text-sm text-muted mt-1">
          {filter ? `Filtrert på ${STATUS_LABELS[filter].toLowerCase()}` : 'Alle ordrer'}
          {' · '}viser opptil 100 nyeste
        </p>
      </div>

      <div className="flex gap-1.5 mb-4 flex-wrap">
        <FilterTab label="Alle" href="/orders" active={!filter} />
        {(Object.keys(STATUS_LABELS) as OrderStatus[]).map(s => (
          <FilterTab key={s} label={STATUS_LABELS[s]} href={`/orders?status=${s}`} active={filter === s} />
        ))}
      </div>

      {error && (
        <div className="panel p-4 mb-4" style={{ background: 'var(--color-danger)20', borderColor: 'var(--color-danger)40' }}>
          <p className="text-sm" style={{ color: 'var(--color-danger)' }}>Feil: {error.message}</p>
        </div>
      )}

      <div className="panel overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr className="text-left text-[11px] uppercase tracking-wider text-subtle">
              <th className="px-4 py-2.5 font-medium">Ordre</th>
              <th className="px-4 py-2.5 font-medium">Mottaker</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 font-medium text-right">Beløp</th>
              <th className="px-4 py-2.5 font-medium">Opprettet</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {(orders ?? []).map((order: OrderRow) => (
              <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-2.5 font-mono text-xs text-muted">{order.id.slice(0, 8)}</td>
                <td className="px-4 py-2.5">
                  <div className="text-sm">{order.shipping_address?.name ?? '—'}</div>
                  {order.shipping_address?.city && (
                    <div className="text-xs text-subtle">{order.shipping_address.city}</div>
                  )}
                </td>
                <td className="px-4 py-2.5">
                  <StatusBadge status={order.status} />
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums font-medium">
                  {order.total_amount.toLocaleString('nb-NO')} kr
                </td>
                <td className="px-4 py-2.5 text-muted text-xs">
                  {new Date(order.created_at).toLocaleString('nb-NO', { dateStyle: 'short', timeStyle: 'short' })}
                </td>
                <td className="px-4 py-2.5">
                  <Link
                    href={`/orders/${order.id}`}
                    className="text-xs font-medium text-muted hover:text-white inline-flex items-center gap-1"
                  >
                    Åpne <ArrowRight className="h-3 w-3" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {(!orders || orders.length === 0) && !error && (
          <div className="p-12 text-center text-sm text-muted">
            Ingen ordrer med dette filteret
          </div>
        )}
      </div>
    </div>
  )
}

function FilterTab({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
        active
          ? 'bg-white/10 text-white border-[var(--color-border-strong)]'
          : 'text-muted border-[var(--color-border)] hover:text-white hover:border-[var(--color-border-strong)]'
      }`}
    >
      {label}
    </Link>
  )
}
