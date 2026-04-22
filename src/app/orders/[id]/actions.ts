'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import type { OrderStatus } from '@/lib/types'

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const { error } = await supabaseAdmin
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath(`/orders/${orderId}`)
  revalidatePath('/orders')
  revalidatePath('/')

  return { success: true }
}
