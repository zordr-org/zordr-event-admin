'use client'

import * as React from 'react'
import { CheckCircle2, Clock, ArrowLeft, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/format'
import type { ReviewCycle } from '../types'

const ACTION_CONFIG = {
  pending: {
    icon: <Clock className="w-4 h-4 text-amber-600" />,
    dot: 'bg-amber-500',
    label: 'Submitted for Review',
    textColor: 'text-amber-700',
  },
  approved: {
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
    dot: 'bg-emerald-500',
    label: 'Approved & Published',
    textColor: 'text-emerald-700',
  },
  sent_back: {
    icon: <ArrowLeft className="w-4 h-4 text-orange-600" />,
    dot: 'bg-orange-500',
    label: 'Sent Back to Organizer',
    textColor: 'text-orange-700',
  },
  rejected: {
    icon: <XCircle className="w-4 h-4 text-red-600" />,
    dot: 'bg-red-500',
    label: 'Rejected',
    textColor: 'text-red-700',
  },
} as const

interface ReviewHistoryTimelineProps {
  cycles: ReviewCycle[]
}

export function ReviewHistoryTimeline({ cycles }: ReviewHistoryTimelineProps) {
  if (cycles.length === 0) {
    return <p className="text-sm text-muted-foreground italic">No review history yet.</p>
  }

  return (
    <ol className="relative space-y-6 border-l border-border ml-2">
      {cycles.map((cycle) => {
        const config = ACTION_CONFIG[cycle.action]
        return (
          <li key={cycle.id} className="ml-4">
            {/* Dot */}
            <span className={cn('absolute -left-1.5 w-3 h-3 rounded-full border-2 border-background', config.dot)} />

            <div className="space-y-1">
              {/* Cycle header */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn('text-sm font-semibold', config.textColor)}>
                  Cycle {cycle.cycleNumber}: {config.label}
                </span>
                {cycle.adminName && (
                  <span className="text-xs text-muted-foreground">by {cycle.adminName}</span>
                )}
              </div>

              {/* Timestamps */}
              <div className="flex gap-3 text-xs text-muted-foreground">
                <span>Submitted {formatRelativeTime(cycle.submittedAt)}</span>
                {cycle.resolvedAt && (
                  <span>· Resolved {formatRelativeTime(cycle.resolvedAt)}</span>
                )}
              </div>

              {/* Notes / Reason */}
              {(cycle.notes || cycle.reason) && (
                <div className="mt-2 p-2.5 rounded-md bg-muted/50 border border-border">
                  <p className="text-xs font-medium text-muted-foreground mb-0.5">
                    {cycle.action === 'sent_back' ? 'Admin Notes' : 'Reason'}
                  </p>
                  <p className="text-sm">{cycle.notes ?? cycle.reason}</p>
                </div>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
