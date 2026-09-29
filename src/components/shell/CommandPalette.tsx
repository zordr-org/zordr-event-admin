'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useSession } from '@/providers/SessionProvider'
import { NAV_ITEMS } from '@/config/nav'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter()
  const { can } = useSession()

  const permittedItems = NAV_ITEMS.filter((item) => can(item.key, 'view'))

  function navigate(href: string) {
    router.push(href)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="overflow-hidden p-0 max-w-[560px]"
        aria-label="Command palette"
      >
        <Command className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-muted-foreground">
          <div className="flex items-center border-b border-border px-4 py-3 gap-3">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />
            <Command.Input
              placeholder="Search or navigate..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              autoFocus
            />
            <kbd className="text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5">
              Esc
            </kbd>
          </div>

          <Command.List className="max-h-[380px] overflow-y-auto p-2">
            <Command.Empty className="py-8 text-center text-sm text-muted-foreground">
              No results found.
            </Command.Empty>

            <Command.Group heading="Navigate" data-testid="palette-nav-group">
              {permittedItems.map((item) => {
                const Icon = item.icon
                return (
                  <Command.Item
                    key={item.key}
                    value={item.label}
                    onSelect={() => navigate(item.href)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm cursor-pointer',
                      'text-foreground hover:bg-accent data-[selected=true]:bg-accent',
                      'transition-colors',
                    )}
                  >
                    <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Icon className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
                    </div>
                    <span>{item.label}</span>
                  </Command.Item>
                )
              })}
            </Command.Group>
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  )
}