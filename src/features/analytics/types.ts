export interface AnalyticsFilters {
  dateFrom: string
  dateTo: string
  granularity?: 'daily' | 'weekly'
}

export interface AnalyticsOverview {
  totalGmv: number
  totalOrders: number
  ticketsSold: number
  activeEvents: number
  uniqueCustomers: number
  conversionRate: number
}

export interface TrendDataPoint {
  date: string
  value: number
  secondaryValue?: number
}

export interface BreakdownDataPoint {
  label: string
  value: number
  percentage: number
}

export interface LeaderboardRow {
  rank: number
  label: string
  metric: number
}

export interface OverviewResponse {
  success: boolean
  data: AnalyticsOverview
}

export interface TrendsResponse {
  success: boolean
  data: TrendDataPoint[]
}

export interface BreakdownsResponse {
  success: boolean
  data: BreakdownDataPoint[]
}

export interface LeaderboardsResponse {
  success: boolean
  data: LeaderboardRow[]
}
