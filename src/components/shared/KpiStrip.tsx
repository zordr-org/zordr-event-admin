'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { KpiCard } from '@/components/shell/KpiCard'

export interface KpiItem {
  id: string
  label: string
  value: string | number
  icon?: React.ReactNode
  delta?: string
  trend?: 'up' | 'down' | 'neutral'
  inverseTrendColor?: boolean
  sub?: string
}

interface KpiStripProps {
  items: KpiItem[]
  isLoading?: boolean
  className?: string
}

export function KpiStrip({ items, isLoading, className }: KpiStripProps) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-3 lg:grid-cols-5", className)}>
      {items.map((item) => (
        <KpiCard
          key={item.id}
          label={item.label}
          value={isLoading ? '-' : String(item.value)}
          delta={isLoading ? undefined : item.delta}
          trend={isLoading ? undefined : item.trend}
          inverseTrendColor={item.inverseTrendColor}
          sub={isLoading ? undefined : item.sub}
          icon={item.icon}
        />
      ))}
    </div>
  )
}

