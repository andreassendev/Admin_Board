import { User, Clock, TrendingUp } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

type CartItem = {
  id: string
  user_id: string
  product_id: string
  quantity: number
  created_at: string
  updated_at: string
}

type ProductMini = { id: string; name: string; price: number; sku: string | null }
type UserMini = { id: string; email: string | null; full_name: string | null }

type CartSummary = {
  user_id: string
  userEmail: string | null
  userName: string | null
  itemCount: number
  totalValue: number
  oldestItem: string
  newestItem: string
  items: Array<{ productName: string; sku: string | null; quantity: number; price: number }>
}

async function getActiveCarts(): Promise<CartSummary[]> {
  const { data: cartItems } = await supabaseAdmin
    .from('cart_items')
    .select('id, user_id, product_id, quantity, created_at, updated_at')
    .order('updated_at', { ascending: false })

  if (!cartItems || cartItems.length === 0) return []

  const productIds = Array.from(new Set(cartItems.map((c: CartItem) => c.product_id)))
  const userIds = Array.from(new Set(cartItems.map((c: CartItem) => c.user_id)))

  const [{ data: products }, { data: users }] = await Promise.all([
    supabaseAdmin.from('products').select('id, name, price, sku').in('id', productIds),
    supabaseAdmin.from('users').select('id, email, full_name').in('id', userIds),
  ])

  const productsById = new Map<string, ProductMini>((products ?? []).map((p: ProductMini) => [p.id, p]))
  const usersById = new Map<string, UserMini>((users ?? []).map((u: UserMini) => [u.id, u]))
  const byUser = new Map<string, CartSummary>()

  for (const item of cartItems as CartItem[]) {
    const product = productsById.get(item.product_id)
    const user = usersById.get(item.user_id)
    if (!product) continue

    if (!byUser.has(item.user_id)) {
      byUser.set(item.user_id, {
        user_id: item.user_id,
        userEmail: user?.email ?? null,
        userName: user?.full_name ?? null,
        itemCount: 0,
        totalValue: 0,
        oldestItem: item.created_at,
        newestItem: item.updated_at,
        items: [],
      })
    }

    const summary = byUser.get(item.user_id)!
    summary.itemCount += item.quantity
    summary.totalValue += product.price * item.quantity
    summary.items.push({ productName: product.name, sku: product.sku, quantity: item.quantity, price: product.price })
    if (item.created_at < summary.oldestItem) summary.oldestItem = item.created_at
    if (item.updated_at > summary.newestItem) summary.newestItem = item.updated_at
  }

  return Array.from(byUser.values()).sort((a, b) => b.totalValue - a.totalValue)
}

function timeSince(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days} dag${days === 1 ? '' : 'er'} siden`
  if (hours > 0) return `${hours} t siden`
  const mins = Math.floor(diffMs / (1000 * 60))
  return `${mins} min siden`
}

export default async function CartsPage() {
  const carts = await getActiveCarts()
  const totalValue = carts.reduce((sum, c) => sum + c.totalValue, 0)
  const totalItems = carts.reduce((sum, c) => sum + c.itemCount, 0)

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Aktive handlekurver</h1>
        <p className="text-sm text-muted mt-1">Kunder med varer klare til kjøp</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <StatCard icon={User} label="Kunder" value={carts.length.toString()} />
        <StatCard icon={TrendingUp} label="Total verdi" value={`${totalValue.toLocaleString('nb-NO')} kr`} />
        <StatCard icon={Clock} label="Varer totalt" value={totalItems.toString()} />
      </div>

      {carts.length === 0 ? (
        <div className="panel p-12 text-center text-sm text-muted">
          Ingen aktive handlekurver akkurat nå
        </div>
      ) : (
        <div className="space-y-3">
          {carts.map(cart => (
            <div key={cart.user_id} className="panel overflow-hidden">
              <div className="px-5 py-3 border-b flex items-center justify-between">
                <div className="min-w-0">
                  <div className="font-medium text-sm truncate">
                    {cart.userName ?? cart.userEmail ?? `Bruker ${cart.user_id.slice(0, 8)}`}
                  </div>
                  {cart.userName && cart.userEmail && (
                    <div className="text-xs text-muted truncate">{cart.userEmail}</div>
                  )}
                  <div className="text-[11px] text-subtle mt-1 flex gap-3 flex-wrap">
                    <span>Lagt til: {timeSince(cart.oldestItem)}</span>
                    <span>Sist aktiv: {timeSince(cart.newestItem)}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xl font-semibold tabular-nums">{cart.totalValue.toLocaleString('nb-NO')} kr</div>
                  <div className="text-xs text-muted">{cart.itemCount} vare{cart.itemCount === 1 ? '' : 'r'}</div>
                </div>
              </div>
              <table className="w-full text-sm">
                <tbody className="divide-y">
                  {cart.items.map((item, i) => (
                    <tr key={i} className="hover:bg-white/[0.02]">
                      <td className="px-5 py-2">
                        <div className="font-medium">{item.productName}</div>
                        {item.sku && <div className="text-[11px] text-subtle font-mono">{item.sku}</div>}
                      </td>
                      <td className="px-5 py-2 text-right text-muted tabular-nums text-xs">
                        {item.quantity}× {item.price.toLocaleString('nb-NO')} kr
                      </td>
                      <td className="px-5 py-2 text-right tabular-nums font-medium">
                        {(item.quantity * item.price).toLocaleString('nb-NO')} kr
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StatCard({ icon: Icon, label, value }: { icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; label: string; value: string }) {
  return (
    <div className="panel p-4">
      <div className="flex items-center gap-2 text-xs text-muted uppercase tracking-wider">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="text-2xl font-semibold mt-2 tabular-nums">{value}</div>
    </div>
  )
}
