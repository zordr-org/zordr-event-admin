import { PackageOpen } from 'lucide-react'

interface EmptyStateProps {
  message?: string
  sub?: string
}

export function EmptyState({
  message = 'Nothing here yet.',
  sub = 'This screen is coming in a future sprint.',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <PackageOpen className="w-7 h-7 text-muted-foreground" aria-hidden="true" />
      </div>
      <p className="text-sm font-medium text-foreground">{message}</p>
      <p className="mt-1 text-sm text-muted-foreground">{sub}</p>
    </div>
  )
}