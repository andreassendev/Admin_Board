'use client'

import { useState, useTransition } from 'react'
import { updateOrderStatus } from './actions'
import type { OrderStatus } from '@/lib/types'

type Props = {
  orderId: string
  currentStatus: OrderStatus
}

export function StatusActions({ orderId, currentStatus }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function setStatus(status: OrderStatus) {
    setError(null)
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, status)
      if (!result.success) setError(result.error ?? 'Ukjent feil')
    })
  }

  const nextActions: Array<{ label: string; status: OrderStatus; color: string }> = []

  if (currentStatus === 'pending' || currentStatus === 'paid') {
    nextActions.push({ label: 'Marker som pakket', status: 'packed', color: 'bg-yellow-600 hover:bg-yellow-700' })
  }
  if (currentStatus === 'packed') {
    nextActions.push({ label: 'Marker som sendt', status: 'shipped', color: 'bg-green-600 hover:bg-green-700' })
  }
  if (currentStatus === 'shipped') {
    nextActions.push({ label: 'Marker som levert', status: 'delivered', color: 'bg-gray-600 hover:bg-gray-700' })
  }
  if (currentStatus !== 'cancelled' && currentStatus !== 'delivered') {
    nextActions.push({ label: 'Avbryt ordre', status: 'cancelled', color: 'bg-red-600 hover:bg-red-700' })
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        {nextActions.map(action => (
          <button
            key={action.status}
            onClick={() => setStatus(action.status)}
            disabled={isPending}
            className={`px-4 py-2 text-white text-sm font-medium rounded disabled:opacity-50 ${action.color}`}
          >
            {isPending ? 'Oppdaterer...' : action.label}
          </button>
        ))}
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  )
}
