'use client'

import * as React from 'react'
import { formatInr, formatNumber } from '@/lib/format'
import type { LeaderboardRow } from '../types'

interface LeaderboardTableProps {
  data: LeaderboardRow[]
  valuePrefix?: 'currency' | 'number'
  isLoading?: boolean
}

export function LeaderboardTable({ data, valuePrefix = 'number', isLoading = false }: LeaderboardTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-muted rounded-full" />
              <div className="w-32 h-4 bg-muted rounded" />
            </div>
            <div className="w-16 h-4 bg-muted rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        No data available for this period.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <tbody>
          {data.map((row, i) => (
            <tr key={row.label + row.rank} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
              <td className="py-3 px-2 w-12 text-center">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-medium text-muted-foreground">
                  {row.rank}
                </span>
              </td>
              <td className="py-3 px-2 font-medium text-foreground">
                {row.label}
              </td>
              <td className="py-3 px-2 text-right text-muted-foreground">
                {valuePrefix === 'currency' ? formatInr(row.metric, true) : formatNumber(row.metric, true)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
