import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

type CartItem = {
  id: string
  user_id: string
  product_id: string
  quantity: number
  created_at: string
  updated_at: string
}

type ProductMini = {
  id: string
  name: string
  price: number
  sku: string | null
}

type UserMini = {
  id: string
  email: string | null
  full_name: string | null
}

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
    summary.items.push({
      productName: product.name,
      sku: product.sku,
      quantity: item.quantity,
      price: product.price,
    })
    if (item.created_at < summary.oldestItem) summary.oldestItem = item.created_at
    if (item.updated_at > summary.newestItem) summary.newestItem = item.updated_at
  }

  return Array.from(byUser.values()).sort((a, b) => b.totalValue - a.totalValue)
}

export default async function CartsPage() {
  const carts = await getActiveCarts()
  const totalValue = carts.reduce((sum, c) => sum + c.totalValue, 0)

  return (
    <main className="min-h-screen">
      <Header />
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Aktive handlekurver</h1>
            <p className="text-sm text-gray-600 mt-1">
              {carts.length} kunder · {totalValue.toLocaleString('nb-NO')} kr total verdi
            </p>
          </div>
          <Link href="/" className="text-sm text-gray-600 hover:text-blue-600">← Dashboard</Link>
        </div>

        {carts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            Ingen aktive handlekurver
          </div>
        ) : (
          <div className="space-y-4">
            {carts.map(cart => (
              <div key={cart.user_id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <div>
                    <div className="font-semibold">
                      {cart.userName ?? cart.userEmail ?? `Bruker ${cart.user_id.slice(0, 8)}`}
                    </div>
                    {cart.userName && cart.userEmail && (
                      <div className="text-sm text-gray-600">{cart.userEmail}</div>
                    )}
                    <div className="text-xs text-gray-500 mt-1">
                      Lagt til: {new Date(cart.oldestItem).toLocaleString('nb-NO')}
                      {' · '}
                      Sist aktiv: {new Date(cart.newestItem).toLocaleString('nb-NO')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{cart.totalValue.toLocaleString('nb-NO')} kr</div>
                    <div className="text-sm text-gray-600">{cart.itemCount} vare{cart.itemCount === 1 ? '' : 'r'}</div>
                  </div>
                </div>
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-gray-100">
                    {cart.items.map((item, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium">{item.productName}</td>
                        <td className="px-4 py-2 text-xs text-gray-500">{item.sku}</td>
                        <td className="px-4 py-2 text-right">{item.quantity}× {item.price.toLocaleString('nb-NO')} kr</td>
                        <td className="px-4 py-2 text-right font-semibold">
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
          <Link href="/orders" className="hover:text-blue-600">Ordrer</Link>
          <Link href="/carts" className="hover:text-blue-600 text-blue-600 font-medium">Handlekurver</Link>
        </nav>
      </div>
    </header>
  )
}
