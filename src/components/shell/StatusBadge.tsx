import { cn } from '@/lib/utils'

// Color mappings taken directly from the design screens.
const STATUS_MAP: Record<string, string> = {
  // Organizer / Event statuses
  approved:   'bg-emerald-100 text-emerald-700',
  published:  'bg-emerald-100 text-emerald-700',
  pending:    'bg-amber-100 text-amber-700',
  rejected:   'bg-red-100 text-red-700',
  cancelled:  'bg-red-100 text-red-700',
  blocked:    'bg-red-100 text-red-700',
  suspended:  'bg-red-100 text-red-700',
  // Order / Payment statuses
  completed:  'bg-emerald-100 text-emerald-700',
  failed:     'bg-red-100 text-red-700',
  refunded:   'bg-purple-100 text-purple-700',
  // Settlement statuses
  paid:       'bg-emerald-100 text-emerald-700',
  'on hold':  'bg-amber-100 text-amber-700',
  // Support statuses
  open:       'bg-blue-100 text-blue-700',
  resolved:   'bg-emerald-100 text-emerald-700',
  closed:     'bg-gray-100 text-gray-600',
  // Employee statuses
  active:     'bg-emerald-100 text-emerald-700',
  inactive:   'bg-gray-100 text-gray-600',
  // KYC
  verified:   'bg-emerald-100 text-emerald-700',
  'not submitted': 'bg-gray-100 text-gray-600',
  // Event lifecycle
  draft:          'bg-gray-100 text-gray-600',
  submitted:      'bg-blue-100 text-blue-700',
  pending_review: 'bg-amber-100 text-amber-700',
  sent_back:      'bg-orange-100 text-orange-700',
  'pending review': 'bg-amber-100 text-amber-700',
  'sent back':    'bg-orange-100 text-orange-700',
}

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const key = status.toLowerCase()
  const colors = STATUS_MAP[key] ?? 'bg-gray-100 text-gray-600'
  const displayStatus = key === 'suspended' ? 'Blocked' : status
  
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize',
        colors,
        className,
      )}
    >
      {displayStatus}
    </span>
  )
}