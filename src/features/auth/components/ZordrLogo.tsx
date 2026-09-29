import { cn } from '@/lib/utils'

interface ZordrLogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showTagline?: boolean
}

export function ZordrLogo({ className, size = 'md', showTagline = false }: ZordrLogoProps) {
  const textSizes = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
  }

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Wordmark: "Z" in brand green, "ordr" in dark navy */}
      <span
        className={cn('font-extrabold leading-none tracking-tight', textSizes[size])}
        style={{ fontFamily: 'var(--font-inter)' }}
        aria-label="Zordr"
      >
        <span className="text-brand">Z</span>
        <span className="text-dark">ordr</span>
      </span>
      {showTagline && (
        <span className="text-xs text-muted-foreground mt-0.5 leading-tight">
          Events. Experiences. Together.
        </span>
      )}
    </div>
  )
}
