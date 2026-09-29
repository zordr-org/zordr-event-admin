'use client'

import * as React from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface FilterBarProps {
  searchQuery?: string
  onSearchChange?: (q: string) => void
  placeholder?: string
  children?: React.ReactNode
  onReset?: () => void
  className?: string
}

export function FilterBar({
  searchQuery = '',
  onSearchChange,
  placeholder = 'Search...',
  children,
  onReset,
  className,
}: FilterBarProps) {
  const [localValue, setLocalValue] = React.useState(searchQuery)

  // Sync prop changes down (e.g. from URL reset)
  React.useEffect(() => {
    setLocalValue(searchQuery)
  }, [searchQuery])

  // Debounce upstream changes
  React.useEffect(() => {
    if (!onSearchChange) return
    const timer = setTimeout(() => {
      onSearchChange(localValue)
    }, 300)
    return () => clearTimeout(timer)
  }, [localValue, onSearchChange])

  return (
    <div className={cn("flex flex-wrap items-center gap-3 p-4 bg-card rounded-md border", className)}>
      <div className="relative flex-1 min-w-[200px] max-w-[400px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          placeholder={placeholder}
          className="pl-9 pr-8"
        />
        {localValue && (
          <button 
            onClick={() => setLocalValue('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 ml-auto">
        {children}
        
        {onReset && (
          <button 
            onClick={onReset}
            className="text-sm font-medium text-primary hover:underline px-2"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  )
}
