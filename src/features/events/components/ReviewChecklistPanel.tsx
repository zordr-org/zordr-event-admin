'use client'

import * as React from 'react'
import { CheckCircle2, Clock, Flag, MessageSquare, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useChecklistUpdate } from '../hooks'
import type { ChecklistItem, ChecklistItemStatus } from '../types'

const STATUS_CONFIG: Record<ChecklistItemStatus, { icon: React.ReactNode; label: string; activeClass: string }> = {
  pending: {
    icon: <Clock className="w-3.5 h-3.5" />,
    label: 'Pending',
    activeClass: 'bg-muted text-muted-foreground border-input ring-1 ring-input',
  },
  looks_good: {
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    label: 'Looks Good',
    activeClass: 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-1 ring-emerald-400',
  },
  flagged: {
    icon: <Flag className="w-3.5 h-3.5" />,
    label: 'Flagged',
    activeClass: 'bg-red-50 text-red-700 border-red-300 ring-1 ring-red-400',
  },
}

interface ChecklistRowProps {
  item: ChecklistItem
  eventId: string
  isReadOnly: boolean
}

function ChecklistRow({ item, eventId, isReadOnly }: ChecklistRowProps) {
  const { mutate, isPending } = useChecklistUpdate(eventId)
  const [showComment, setShowComment] = React.useState(!!item.comment)
  const [commentDraft, setCommentDraft] = React.useState(item.comment ?? '')
  const commentTimerRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const handleStatusChange = (status: ChecklistItemStatus) => {
    if (isReadOnly || status === item.status) return
    mutate({ item: item.key, status, comment: commentDraft || undefined })
  }

  const handleCommentChange = (val: string) => {
    setCommentDraft(val)
    clearTimeout(commentTimerRef.current)
    commentTimerRef.current = setTimeout(() => {
      mutate({ item: item.key, status: item.status, comment: val || undefined })
    }, 800)
  }

  return (
    <div
      className={cn(
        'rounded-lg border p-3 space-y-2 transition-colors',
        item.status === 'looks_good' && 'bg-emerald-50/50 border-emerald-200',
        item.status === 'flagged' && 'bg-red-50/50 border-red-200',
        item.status === 'pending' && 'bg-card border-border',
      )}
    >
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="text-sm font-medium">{item.label}</span>

        <div className="flex items-center gap-1 shrink-0">
          {(['pending', 'looks_good', 'flagged'] as ChecklistItemStatus[]).map((status) => {
            const cfg = STATUS_CONFIG[status]
            const isActive = item.status === status
            return (
              <button
                key={status}
                title={cfg.label}
                disabled={isReadOnly || isPending}
                onClick={() => handleStatusChange(status)}
                aria-pressed={isActive}
                className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border transition-all',
                  isActive ? cfg.activeClass : 'bg-transparent text-muted-foreground border-input hover:border-foreground/30',
                  (isReadOnly || isPending) && 'cursor-not-allowed opacity-60',
                )}
              >
                {cfg.icon}
                <span className="hidden sm:inline">{cfg.label}</span>
              </button>
            )
          })}

          {/* Comment toggle */}
          <button
            title="Add comment"
            disabled={isReadOnly}
            onClick={() => setShowComment((v) => !v)}
            className={cn(
              'p-1.5 rounded-md border transition-colors',
              showComment ? 'bg-blue-50 text-blue-600 border-blue-200' : 'text-muted-foreground border-input hover:border-foreground/30',
              isReadOnly && 'cursor-not-allowed opacity-60',
            )}
          >
            <MessageSquare className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {showComment && (
        <textarea
          value={commentDraft}
          onChange={(e) => handleCommentChange(e.target.value)}
          disabled={isReadOnly || isPending}
          placeholder="Add a comment about this item..."
          rows={2}
          className="w-full text-xs rounded-md border border-input bg-background px-2.5 py-1.5 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 resize-none"
        />
      )}
    </div>
  )
}

interface ReviewChecklistPanelProps {
  checklist: ChecklistItem[]
  eventId: string
  isReadOnly?: boolean
}

export function ReviewChecklistPanel({ checklist, eventId, isReadOnly = false }: ReviewChecklistPanelProps) {
  const doneCount = checklist.filter((c) => c.status === 'looks_good').length
  const flaggedCount = checklist.filter((c) => c.status === 'flagged').length
  const total = checklist.length

  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Review Checklist</h3>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-emerald-600 font-medium">{doneCount}/{total} OK</span>
          {flaggedCount > 0 && (
            <span className="text-red-600 font-medium">{flaggedCount} flagged</span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
          style={{ width: `${(doneCount / total) * 100}%` }}
        />
      </div>

      <div className="space-y-2">
        {checklist.map((item) => (
          <ChecklistRow key={item.key} item={item} eventId={eventId} isReadOnly={isReadOnly} />
        ))}
      </div>
    </div>
  )
}
