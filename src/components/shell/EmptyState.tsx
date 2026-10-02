import { PackageOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface EmptyStateProps {
  title?: string
  description?: string
  message?: string
  sub?: string
  action?: {
    label: string
    onClick: () => void | Promise<any>
  }
}

export function EmptyState({
  title,
  description,
  message,
  sub,
  action,
}: EmptyStateProps) {
  const displayTitle = title || message || 'Nothing here yet.'
  const displayDescription = description || sub || 'This screen is coming in a future sprint.'

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <PackageOpen className="w-7 h-7 text-muted-foreground" aria-hidden="true" />
      </div>
      <p className="text-sm font-medium text-foreground">{displayTitle}</p>
      <p className="mt-1 text-sm text-muted-foreground mb-4">{displayDescription}</p>
      {action && (
        <Button onClick={action.onClick} variant="outline" size="sm">
          {action.label}
        </Button>
      )}
    </div>
  )
}