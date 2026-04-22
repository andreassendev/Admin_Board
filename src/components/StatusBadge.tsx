import { Clock, CreditCard, PackageCheck, Truck, CheckCircle2, XCircle } from 'lucide-react'
import type { OrderStatus } from '@/lib/types'

const CONFIG: Record<OrderStatus, { label: string; icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; color: string }> = {
  pending: { label: 'Ventende', icon: Clock, color: 'var(--color-danger)' },
  paid: { label: 'Betalt', icon: CreditCard, color: 'var(--color-info)' },
  packed: { label: 'Pakket', icon: PackageCheck, color: 'var(--color-warning)' },
  shipped: { label: 'Sendt', icon: Truck, color: 'var(--color-success)' },
  delivered: { label: 'Levert', icon: CheckCircle2, color: 'var(--color-text-muted)' },
  cancelled: { label: 'Avbrutt', icon: XCircle, color: 'var(--color-text-subtle)' },
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  const config = CONFIG[status]
  const Icon = config.icon
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-medium rounded-md"
      style={{
        color: config.color,
        background: `${config.color}15`,
        border: `1px solid ${config.color}30`,
      }}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  )
}
