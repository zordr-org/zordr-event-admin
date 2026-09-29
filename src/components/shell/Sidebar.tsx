'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, Zap, ChevronLeft, ChevronRight } from 'lucide-react'
import { useSession } from '@/providers/SessionProvider'
import { NAV_ITEMS } from '@/config/nav'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
}

export function Sidebar() {
  const { can, user } = useSession()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  // Persist collapse preference without crashing in SSR/restricted env
  useEffect(() => {
    try {
      const stored = localStorage.getItem('zordr_sidebar_collapsed')
      if (stored !== null) setCollapsed(stored === 'true')
    } catch {
      // localStorage may be unavailable (e.g. incognito with strict settings)
    }
  }, [])

  const toggleCollapsed = () => {
    const next = !collapsed
    setCollapsed(next)
    try {
      localStorage.setItem('zordr_sidebar_collapsed', String(next))
    } catch {}
  }

  const visibleItems = NAV_ITEMS.filter((item) => can(item.key, 'view'))

  // Active item: first nav item whose href matches the start of the pathname
  const activeItem =
    visibleItems.find(
      (item) => pathname === item.href || pathname.startsWith(item.href + '/'),
    ) ?? visibleItems[0]

  return (
    <TooltipProvider delayDuration={200}>
      <aside
        data-testid="sidebar"
        className={cn(
          'relative flex flex-col h-screen bg-dark-sidebar shrink-0',
          'transition-[width] duration-200 ease-in-out',
          collapsed ? 'w-[60px]' : 'w-[180px]',
        )}
        aria-label="Admin navigation"
      >
        {/* ── Logo ─────────────────────────────────────────────────────────── */}
        <div
          className={cn(
            'flex items-center gap-2 pt-5 pb-3',
            collapsed ? 'justify-center px-3' : 'px-4',
          )}
        >
          <span className="font-extrabold text-xl leading-none tracking-tight shrink-0">
            <span className="text-brand">Z</span>
            <span className="text-white">ordr</span>
          </span>
          {!collapsed && (
            <span className="sr-only">Events. Experiences. Together.</span>
          )}
        </div>

        {/* ── Admin Portal badge ────────────────────────────────────────────── */}
        {!collapsed ? (
          <div className="mx-3 mb-4">
            <div className="flex items-center gap-1.5 bg-brand/[0.15] border border-brand/25 rounded-full px-3 py-1">
              <BarChart3 className="w-3 h-3 text-brand shrink-0" aria-hidden="true" />
              <span className="text-[11px] font-semibold text-brand">Admin Portal</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center mb-3">
            <BarChart3 className="w-4 h-4 text-brand" aria-hidden="true" />
          </div>
        )}

        {/* ── Nav ──────────────────────────────────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto px-2 space-y-0.5" aria-label="Main navigation">
          {visibleItems.map((item) => {
            const Icon = item.icon
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + '/')

            const linkContent = (
              <Link
                key={item.key}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex items-center rounded-lg text-sm font-medium transition-colors duration-100',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 focus-visible:ring-offset-dark-sidebar',
                  collapsed ? 'justify-center p-2.5' : 'gap-2.5 px-3 py-2',
                  isActive
                    ? 'bg-brand text-white'
                    : 'text-white/65 hover:bg-white/[0.08] hover:text-white',
                )}
              >
                <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )

            if (collapsed) {
              return (
                <Tooltip key={item.key}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              )
            }

            return linkContent
          })}
        </nav>

        {/* ── Bottom ───────────────────────────────────────────────────────── */}
        <div className="border-t border-white/10 pt-3 pb-4 px-3">
          {!collapsed && (
            <div className="mb-3">
              <div className="flex items-start gap-2">
                <Zap className="w-3.5 h-3.5 text-brand shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-[11px] text-white/55 leading-tight">
                  {activeItem?.tagline ?? 'Building bigger experiences together.'}
                </p>
              </div>
              <p className="text-[10px] text-white/25 mt-2 pl-0">Zordr Admin v1.0.0</p>
            </div>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={toggleCollapsed}
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                className={cn(
                  'flex items-center justify-center rounded-lg p-1.5 w-full',
                  'text-white/35 hover:text-white/65 hover:bg-white/[0.06]',
                  'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
                )}
              >
                {collapsed ? (
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            </TooltipContent>
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  )
}