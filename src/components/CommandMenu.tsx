'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import { LayoutDashboard, Package, ShoppingCart, PackageCheck, Truck, Clock } from 'lucide-react'

export function CommandMenu() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(v => !v)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    function onOpen() { setOpen(true) }

    document.addEventListener('keydown', onKeyDown)
    window.addEventListener('open-command-menu', onOpen)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('open-command-menu', onOpen)
    }
  }, [])

  function go(href: string) {
    router.push(href)
    setOpen(false)
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={() => setOpen(false)}
    >
      <div onClick={e => e.stopPropagation()} className="w-full max-w-lg panel-raised shadow-2xl overflow-hidden">
        <Command label="Hurtigsøk">
          <div className="border-b">
            <Command.Input
              placeholder="Hva vil du gjøre?"
              className="w-full px-4 py-3 bg-transparent outline-none text-sm placeholder:text-subtle"
              autoFocus
            />
          </div>
          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="p-4 text-center text-sm text-muted">
              Ingen treff
            </Command.Empty>

            <Command.Group heading="Naviger">
              <CmdItem icon={LayoutDashboard} onSelect={() => go('/')}>
                Dashboard
              </CmdItem>
              <CmdItem icon={Package} onSelect={() => go('/orders')}>
                Alle ordrer
              </CmdItem>
              <CmdItem icon={ShoppingCart} onSelect={() => go('/carts')}>
                Aktive handlekurver
              </CmdItem>
            </Command.Group>

            <Command.Group heading="Filtrer ordrer">
              <CmdItem icon={Clock} onSelect={() => go('/orders?status=pending')}>
                Ventende ordrer
              </CmdItem>
              <CmdItem icon={PackageCheck} onSelect={() => go('/orders?status=packed')}>
                Pakket — klar til sending
              </CmdItem>
              <CmdItem icon={Truck} onSelect={() => go('/orders?status=shipped')}>
                Sendte ordrer
              </CmdItem>
            </Command.Group>
          </Command.List>

          <div className="border-t px-3 py-2 text-[11px] text-subtle flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1"><kbd className="kbd">↑↓</kbd> Naviger</span>
              <span className="flex items-center gap-1"><kbd className="kbd">↵</kbd> Velg</span>
            </div>
            <span className="flex items-center gap-1"><kbd className="kbd">Esc</kbd> Lukk</span>
          </div>
        </Command>
      </div>
    </div>
  )
}

function CmdItem({ icon: Icon, children, onSelect }: { icon: React.ComponentType<{ className?: string }>; children: React.ReactNode; onSelect: () => void }) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex items-center gap-2 px-3 py-2 rounded text-sm cursor-pointer data-[selected=true]:bg-white/10 text-muted data-[selected=true]:text-white"
    >
      <Icon className="h-3.5 w-3.5" />
      {children}
    </Command.Item>
  )
}
