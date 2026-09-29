'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, ChevronDown, LogOut, Search, User } from 'lucide-react'
import { useSession } from '@/providers/SessionProvider'
import { postLogout } from '@/lib/api/client'
import { CommandPalette } from './CommandPalette'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useEffect } from 'react'

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
}

export function Topbar() {
  const { user } = useSession()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [paletteOpen, setPaletteOpen] = useState(false)

  // Global keyboard shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setPaletteOpen((v) => !v)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  const { mutate: logout, isPending: isLoggingOut } = useMutation({
    mutationFn: postLogout,
    onSuccess: () => {
      queryClient.clear()
      router.replace('/login')
    },
  })

  return (
    <>
      <header className="h-14 flex items-center gap-4 px-6 bg-white border-b border-border shrink-0">
        {/* Search bar trigger */}
        <button
          id="topbar-search"
          onClick={() => setPaletteOpen(true)}
          aria-label="Open search"
          className={cn(
            'flex items-center gap-2 flex-1 max-w-[380px] h-9 rounded-lg px-3',
            'bg-muted/60 border border-border text-sm text-muted-foreground',
            'hover:border-brand/40 hover:bg-muted transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          )}
        >
          <Search className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span className="flex-1 text-left">Search anything...</span>
          <kbd className="hidden sm:inline-flex text-[10px] border border-border rounded px-1.5 py-0.5 font-mono">
            ⌘ K
          </kbd>
        </button>

        <div className="ml-auto flex items-center gap-3">
          {/* Notification bell */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                id="topbar-notifications"
                aria-label="Notifications"
                className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Bell className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                <span
                  className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive"
                  aria-label="You have notifications"
                />
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80">
              <p className="text-sm font-semibold text-foreground mb-1">Notifications</p>
              <p className="text-sm text-muted-foreground">No new notifications.</p>
            </PopoverContent>
          </Popover>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger
              id="topbar-user-menu"
              aria-label="User menu"
              className="flex items-center gap-2.5 rounded-lg px-2 py-1 hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Avatar className="w-8 h-8">
                <AvatarFallback>
                  {user ? getInitials(user.name) : '?'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-foreground leading-tight">
                  {user?.name ?? 'Loading...'}
                </p>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  {user?.roleName ?? ''}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <p className="font-semibold text-foreground">{user?.name}</p>
                <p className="text-xs text-muted-foreground font-normal">{user?.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                id="topbar-logout"
                onClick={() => logout()}
                disabled={isLoggingOut}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
                {isLoggingOut ? 'Signing out...' : 'Sign out'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </>
  )
}