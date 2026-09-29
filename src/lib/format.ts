export function formatInr(value: number, compact = false): string {
  if (compact) {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(1).replace(/\.0$/, '')}Cr`
    }
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1).replace(/\.0$/, '')}L`
    }
    if (value >= 1000) {
      return `₹${(value / 1000).toFixed(1).replace(/\.0$/, '')}K`
    }
  }
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatNumber(value: number, compact = false): string {
  if (compact) {
    if (value >= 10000000) return `${(value / 10000000).toFixed(1).replace(/\.0$/, '')}Cr`
    if (value >= 100000) return `${(value / 100000).toFixed(1).replace(/\.0$/, '')}L`
    if (value >= 1000) return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}K`
  }
  return new Intl.NumberFormat('en-IN').format(value)
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) {
    const formatter = new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: 'numeric', hour12: true })
    return formatter.format(date)
  }
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  
  return new Intl.DateTimeFormat('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}
