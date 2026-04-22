'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function ShortcutProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const lastGRef = useRef<number>(0)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return
      if (e.metaKey || e.ctrlKey || e.altKey) return

      const now = Date.now()

      if (e.key === 'g' || e.key === 'G') {
        lastGRef.current = now
        return
      }

      if (now - lastGRef.current < 1000) {
        const key = e.key.toLowerCase()
        const routes: Record<string, { path: string; label: string }> = {
          d: { path: '/', label: 'Dashboard' },
          o: { path: '/orders', label: 'Ordrer' },
          c: { path: '/carts', label: 'Handlekurver' },
        }
        const target = routes[key]
        if (target) {
          e.preventDefault()
          router.push(target.path)
          toast(`→ ${target.label}`, { duration: 1000 })
          lastGRef.current = 0
        }
      }

      if (e.key === '?') {
        e.preventDefault()
        toast('Hurtigtaster', {
          description: 'Cmd+K: søk · G D: dashboard · G O: ordrer · G C: kurver',
          duration: 4000,
        })
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [router])

  return <>{children}</>
}
