'use client'

import { usePathname } from 'next/navigation'
import { ShieldOff } from 'lucide-react'
import { useSession } from '@/providers/SessionProvider'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { Skeleton } from '@/components/ui/skeleton'
import { NAV_ITEMS } from '@/config/nav'

function LoadingShell() {
  return (
    <div className="flex h-screen">
      <div className="w-[180px] bg-dark-sidebar shrink-0" />
      <div className="flex-1 flex flex-col">
        <div className="h-14 border-b border-border bg-white flex items-center px-6 gap-4">
          <Skeleton className="h-8 w-72" />
          <div className="ml-auto flex gap-3">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <Skeleton className="h-9 w-32 rounded-lg" />
          </div>
        </div>
        <div className="flex-1 p-8 space-y-4">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-96" />
          <div className="grid grid-cols-4 gap-4 mt-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ForbiddenView() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 py-24 text-center">
      <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
        <ShieldOff className="w-7 h-7 text-destructive" aria-hidden="true" />
      </div>
      <h2 className="text-lg font-bold text-foreground">Access Denied</h2>
      <p className="mt-1 text-sm text-muted-foreground max-w-sm">
        You do not have permission to view this page. Contact your administrator if you believe
        this is an error.
      </p>
    </div>
  )
}

interface AdminShellProps {
  children: React.ReactNode
}

export function AdminShell({ children }: AdminShellProps) {
  const { isLoading, user, can } = useSession()
  const pathname = usePathname()

  if (isLoading) return <LoadingShell />

  // Determine which module the current path belongs to
  const currentItem = NAV_ITEMS.find(
    (item) => pathname === item.href || pathname.startsWith(item.href + '/'),
  )

  // If the route maps to a known module and the user lacks view permission: show 403
  const isForbidden = currentItem !== undefined && user !== null && !can(currentItem.key, 'view')

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar: hidden on mobile, overlay handled by mobile menu (future) */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main
          className="flex-1 overflow-y-auto bg-background"
          id="main-content"
        >
          {isForbidden ? <ForbiddenView /> : children}
        </main>
      </div>
    </div>
  )
}