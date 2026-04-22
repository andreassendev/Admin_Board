'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { PackageCheck, Truck, CheckCircle2, XCircle } from 'lucide-react'
import { updateOrderStatus } from './actions'
import type { OrderStatus } from '@/lib/types'

type Props = {
  orderId: string
  currentStatus: OrderStatus
}

type Action = { label: string; status: OrderStatus; icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; color: string; primary?: boolean }

export function StatusActions({ orderId, currentStatus }: Props) {
  const [isPending, startTransition] = useTransition()
  const [activeStatus, setActiveStatus] = useState<OrderStatus | null>(null)

  function setStatus(status: OrderStatus, label: string) {
    setActiveStatus(status)
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, status)
      if (result.success) {
        toast.success(`Ordre ${label.toLowerCase()}`, {
          description: `Status satt til "${label}"`,
        })
      } else {
        toast.error('Kunne ikke oppdatere ordre', {
          description: result.error ?? 'Ukjent feil',
        })
      }
      setActiveStatus(null)
    })
  }

  const actions: Action[] = []

  if (currentStatus === 'pending' || currentStatus === 'paid') {
    actions.push({ label: 'Marker som pakket', status: 'packed', icon: PackageCheck, color: 'var(--color-warning)', primary: true })
  }
  if (currentStatus === 'packed') {
    actions.push({ label: 'Marker som sendt', status: 'shipped', icon: Truck, color: 'var(--color-success)', primary: true })
  }
  if (currentStatus === 'shipped') {
    actions.push({ label: 'Marker som levert', status: 'delivered', icon: CheckCircle2, color: 'var(--color-text-muted)', primary: true })
  }
  if (currentStatus !== 'cancelled' && currentStatus !== 'delivered') {
    actions.push({ label: 'Avbryt ordre', status: 'cancelled', icon: XCircle, color: 'var(--color-danger)' })
  }

  if (actions.length === 0) {
    return <p className="text-sm text-muted">Ordren er ferdigbehandlet.</p>
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {actions.map(action => {
        const Icon = action.icon
        const loading = isPending && activeStatus === action.status
        return (
          <button
            key={action.status}
            onClick={() => setStatus(action.status, action.label.replace(/^Marker som /i, ''))}
            disabled={isPending}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md border transition-colors disabled:opacity-50 ${
              action.primary
                ? 'text-white hover:brightness-110'
                : 'text-muted hover:text-white hover:border-[var(--color-border-strong)]'
            }`}
            style={
              action.primary
                ? { background: action.color, borderColor: action.color }
                : { background: 'transparent', borderColor: 'var(--color-border)' }
            }
          >
            <Icon className="h-3.5 w-3.5" />
            {loading ? 'Oppdaterer…' : action.label}
          </button>
        )
      })}
    </div>
  )
}
