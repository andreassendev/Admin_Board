import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

async function getStats() {
  const [pending, packed, shipped, activeCarts] = await Promise.all([
    supabaseAdmin.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabaseAdmin.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'packed'),
    supabaseAdmin.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'shipped'),
    supabaseAdmin.from('cart_items').select('user_id', { count: 'exact', head: true }),
  ])

  return {
    pending: pending.count ?? 0,
    packed: packed.count ?? 0,
    shipped: shipped.count ?? 0,
    cartItems: activeCarts.count ?? 0,
  }
}

export default async function DashboardPage() {
  const stats = await getStats()

  return (
    <main className="min-h-screen">
      <Header />
      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Ventende ordrer"
            value={stats.pending}
            color="red"
            href="/orders?status=pending"
          />
          <StatCard
            label="Pakket (klar til å sendes)"
            value={stats.packed}
            color="yellow"
            href="/orders?status=packed"
          />
          <StatCard
            label="Sendt"
            value={stats.shipped}
            color="green"
            href="/orders?status=shipped"
          />
          <StatCard
            label="Varer i aktive handlekurver"
            value={stats.cartItems}
            color="blue"
            href="/carts"
          />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold text-lg mb-4">Neste steg</h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• Klikk "Ventende ordrer" for å se hva som må pakkes</li>
            <li>• Klikk "Pakket" for å printe fraktetiketter og sende</li>
            <li>• Se "Varer i handlekurver" for å følge med på potensielle salg</li>
          </ul>
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
          <Link href="/orders" className="hover:text-blue-600">Ordrer</Link>
          <Link href="/carts" className="hover:text-blue-600">Handlekurver</Link>
        </nav>
      </div>
    </header>
  )
}

const colorClasses = {
  red: 'bg-red-50 text-red-700 border-red-200',
  yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  green: 'bg-green-50 text-green-700 border-green-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
}

function StatCard({ label, value, color, href }: { label: string; value: number; color: keyof typeof colorClasses; href: string }) {
  return (
    <Link
      href={href}
      className={`block rounded-lg border p-4 hover:shadow-md transition-shadow ${colorClasses[color]}`}
    >
      <div className="text-sm font-medium">{label}</div>
      <div className="text-3xl font-bold mt-1">{value}</div>
    </Link>
  )
}
