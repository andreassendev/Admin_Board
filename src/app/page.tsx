import Link from 'next/link'
import { Clock, PackageCheck, Truck, ShoppingCart, ArrowUpRight } from 'lucide-react'
import { Sparkline } from '@/components/Sparkline'
import { getDashboardStats } from '@/lib/stats'

type StatCard = {
  label: string
  value: number
  trend: number[]
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  color: string
  href: string
  hint: string
}

export default async function DashboardPage() {
  const stats = await getDashboardStats()

  const cards: StatCard[] = [
    {
      label: 'Ventende',
      value: stats.pending.count,
      trend: stats.pending.trend,
      icon: Clock,
      color: 'var(--color-danger)',
      href: '/orders?status=pending',
      hint: 'Trenger pakking',
    },
    {
      label: 'Pakket',
      value: stats.packed.count,
      trend: stats.packed.trend,
      icon: PackageCheck,
      color: 'var(--color-warning)',
      href: '/orders?status=packed',
      hint: 'Klar til sending',
    },
    {
      label: 'Sendt',
      value: stats.shipped.count,
      trend: stats.shipped.trend,
      icon: Truck,
      color: 'var(--color-success)',
      href: '/orders?status=shipped',
      hint: 'Underveis',
    },
    {
      label: 'Aktive kurver',
      value: stats.carts.count,
      trend: stats.carts.trend,
      icon: ShoppingCart,
      color: 'var(--color-info)',
      href: '/carts',
      hint: 'Varer i handlekurv',
    },
  ]

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted mt-1">
          Oversikt over ordrer, sendinger og aktive handlekurver
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {cards.map(card => {
          const Icon = card.icon
          return (
            <Link
              key={card.href}
              href={card.href}
              className="panel p-4 hover:border-[var(--color-border-strong)] transition-colors group block"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" style={{ color: card.color }} />
                  <span className="text-xs font-medium text-muted uppercase tracking-wider">
                    {card.label}
                  </span>
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-subtle group-hover:text-muted transition-colors" />
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-3xl font-semibold tabular-nums">{card.value}</div>
                  <div className="text-[11px] text-subtle mt-1">{card.hint}</div>
                </div>
                <Sparkline values={card.trend} color={card.color} />
              </div>
            </Link>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 panel p-6">
          <h2 className="font-semibold mb-4 text-sm">Arbeidsflyt</h2>
          <div className="space-y-3 text-sm">
            <WorkflowStep number={1} label="Ventende" description="Ny ordre kommer inn" color="var(--color-danger)" />
            <WorkflowStep number={2} label="Pakket" description="Vare er lagt i boks, klar for frakt" color="var(--color-warning)" />
            <WorkflowStep number={3} label="Sendt" description="Pakke er overlevert Posten/Bring" color="var(--color-success)" />
            <WorkflowStep number={4} label="Levert" description="Kunde har mottatt varen" color="var(--color-text-muted)" last />
          </div>
        </div>

        <div className="panel p-6">
          <h2 className="font-semibold mb-4 text-sm">Hurtigtaster</h2>
          <div className="space-y-2 text-sm">
            <ShortcutRow combo={['⌘', 'K']} label="Åpne søk/handlinger" />
            <ShortcutRow combo={['G', 'D']} label="Gå til dashboard" />
            <ShortcutRow combo={['G', 'O']} label="Gå til ordrer" />
            <ShortcutRow combo={['G', 'C']} label="Gå til handlekurver" />
            <ShortcutRow combo={['?']} label="Vis alle hurtigtaster" />
          </div>
        </div>
      </div>
    </div>
  )
}

function WorkflowStep({ number, label, description, color, last }: { number: number; label: string; description: string; color: string; last?: boolean }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold"
          style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}
        >
          {number}
        </div>
        {!last && <div className="w-px h-6 bg-[var(--color-border)] my-1" />}
      </div>
      <div>
        <div className="font-medium text-sm">{label}</div>
        <div className="text-xs text-muted">{description}</div>
      </div>
    </div>
  )
}

function ShortcutRow({ combo, label }: { combo: string[]; label: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted">{label}</span>
      <div className="flex gap-1">
        {combo.map((key, i) => <kbd key={i} className="kbd">{key}</kbd>)}
      </div>
    </div>
  )
}
