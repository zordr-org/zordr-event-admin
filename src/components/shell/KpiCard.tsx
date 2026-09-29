import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KpiCardProps {
  label: string
  value: string
  delta?: string
  trend?: 'up' | 'down' | 'neutral'
  inverseTrendColor?: boolean
  sub?: string
  icon?: React.ReactNode
}

export function KpiCard({ label, value, delta, trend, inverseTrendColor = false, sub, icon }: KpiCardProps) {
  const upColor = inverseTrendColor ? 'text-destructive' : 'text-brand'
  const downColor = inverseTrendColor ? 'text-brand' : 'text-destructive'

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-muted-foreground">{label}</p>
        {icon && (
          <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
      </div>
      <div className="mt-2 flex items-end gap-2">
        <span className="text-2xl font-bold text-foreground">{value}</span>
        {delta && (
          <span
            className={cn(
              'flex items-center gap-0.5 text-xs font-semibold mb-0.5',
              trend === 'up' && upColor,
              trend === 'down' && downColor,
              trend === 'neutral' && 'text-muted-foreground',
            )}
          >
            {trend === 'up' && <TrendingUp className="w-3 h-3" aria-hidden="true" />}
            {trend === 'down' && <TrendingDown className="w-3 h-3" aria-hidden="true" />}
            {delta}
          </span>
        )}
      </div>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  )
}