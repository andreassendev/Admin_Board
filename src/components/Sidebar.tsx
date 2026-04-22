'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, ShoppingCart, Search } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, shortcut: 'G D' },
  { href: '/orders', label: 'Ordrer', icon: Package, shortcut: 'G O' },
  { href: '/carts', label: 'Handlekurver', icon: ShoppingCart, shortcut: 'G C' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 flex-shrink-0 border-r flex flex-col" style={{ background: 'var(--color-panel)' }}>
      <div className="px-4 py-4 border-b">
        <div className="font-semibold text-sm">ELgrossist</div>
        <div className="text-subtle text-xs">Admin</div>
      </div>

      <button
        type="button"
        onClick={() => window.dispatchEvent(new CustomEvent('open-command-menu'))}
        className="mx-3 mt-3 flex items-center gap-2 px-2.5 py-1.5 text-sm text-muted hover:text-white panel-raised focus-ring transition-colors"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="flex-1 text-left">Hurtigsøk...</span>
        <span className="flex gap-1">
          <kbd className="kbd">⌘</kbd>
          <kbd className="kbd">K</kbd>
        </span>
      </button>

      <nav className="mt-4 px-2 space-y-0.5">
        {NAV_ITEMS.map(item => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded text-sm transition-colors ${
                isActive ? 'bg-white/5 text-white' : 'text-muted hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="flex-1">{item.label}</span>
              <span className="text-subtle text-[10px]">{item.shortcut}</span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto px-4 py-3 border-t text-subtle text-[11px]">
        v0.1.0 · Internal use only
      </div>
    </aside>
  )
}
