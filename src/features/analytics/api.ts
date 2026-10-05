import { apiFetch } from '@/lib/api/client'
import type { 
  AnalyticsFilters, 
  OverviewResponse, 
  TrendsResponse, 
  BreakdownsResponse, 
  LeaderboardsResponse 
} from './types'

export interface AnalyticsApi {
  getOverview(filters: AnalyticsFilters): Promise<OverviewResponse>
  getTrends(metric: 'gmv' | 'orders_customers' | 'user_growth', filters: AnalyticsFilters): Promise<TrendsResponse>
  getBreakdowns(type: 'payment_method' | 'order_status' | 'settlement_status', filters: AnalyticsFilters): Promise<BreakdownsResponse>
  getLeaderboards(type: 'top_events' | 'top_organizers' | 'customers_by_city', filters: AnalyticsFilters & { limit?: number }): Promise<LeaderboardsResponse>
  downloadReport(filters: AnalyticsFilters & { format: 'pdf' | 'csv' }): Promise<Blob>
}

class HttpAnalyticsApi implements AnalyticsApi {
  async getOverview(filters: AnalyticsFilters): Promise<OverviewResponse> {
    const params = new URLSearchParams({ dateFrom: filters.dateFrom, dateTo: filters.dateTo })
    return apiFetch<OverviewResponse>(`/api/admin/analytics/overview?${params}`)
  }

  async getTrends(metric: 'gmv' | 'orders_customers' | 'user_growth', filters: AnalyticsFilters): Promise<TrendsResponse> {
    const params = new URLSearchParams({ 
      metric, 
      dateFrom: filters.dateFrom, 
      dateTo: filters.dateTo,
      granularity: filters.granularity || 'daily'
    })
    return apiFetch<TrendsResponse>(`/api/admin/analytics/trends?${params}`)
  }

  async getBreakdowns(type: 'payment_method' | 'order_status' | 'settlement_status', filters: AnalyticsFilters): Promise<BreakdownsResponse> {
    const params = new URLSearchParams({ type, dateFrom: filters.dateFrom, dateTo: filters.dateTo })
    return apiFetch<BreakdownsResponse>(`/api/admin/analytics/breakdowns?${params}`)
  }

  async getLeaderboards(type: 'top_events' | 'top_organizers' | 'customers_by_city', filters: AnalyticsFilters & { limit?: number }): Promise<LeaderboardsResponse> {
    const params = new URLSearchParams({ 
      type, 
      dateFrom: filters.dateFrom, 
      dateTo: filters.dateTo,
      limit: String(filters.limit || 10)
    })
    return apiFetch<LeaderboardsResponse>(`/api/admin/analytics/leaderboards?${params}`)
  }

  async downloadReport(filters: AnalyticsFilters & { format: 'pdf' | 'csv' }): Promise<Blob> {
    const params = new URLSearchParams({ 
      dateFrom: filters.dateFrom, 
      dateTo: filters.dateTo, 
      format: filters.format 
    })
    const res = await fetch(`/api/admin/analytics/report?${params}`, {
      headers: {
        'Authorization': `Bearer mock-token` // simulated
      }
    })
    if (!res.ok) throw new Error('Failed to download report')
    return res.blob()
  }
}

export const getAnalyticsApi = (): AnalyticsApi => new HttpAnalyticsApi()
