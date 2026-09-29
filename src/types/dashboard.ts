export type TimeRange = '7d' | '30d' | '90d'

export interface KpiData {
  key: string
  value: string
  previousValue?: string
  deltaPct?: string
  deltaTrend?: 'up' | 'down' | 'neutral'
  subtitle?: string
}

export interface TrendDataPoint {
  date: string
  value: number
  secondaryValue?: number
}

export interface ActivityItem {
  id: string
  type: 'organizer_onboarded' | 'event_created' | 'ticket_sold' | 'refund_requested' | 'settlement_completed' | 'event_published' | 'support_ticket' | 'payment_failed'
  details: string
  user: string
  status: string
  timestamp: string
}

export interface LiveEvent {
  id: string
  title: string
  location: string
  attendingCount: number
  imageUrl: string
}

export interface DashboardSummary {
  kpis: KpiData[]
  trends: {
    revenue: TrendDataPoint[]
    registrations: TrendDataPoint[]
    platformGrowth: TrendDataPoint[]
  }
  recentActivity: ActivityItem[]
  liveEvents: LiveEvent[]
}
