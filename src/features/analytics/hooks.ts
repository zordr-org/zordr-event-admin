import { useQuery, useMutation } from '@tanstack/react-query'
import { getAnalyticsApi } from './api'
import type { AnalyticsFilters } from './types'
import { useSession } from '@/providers/SessionProvider'

const api = getAnalyticsApi()

export const analyticsKeys = {
  all: ['analytics'] as const,
  overview: (filters: AnalyticsFilters) => [...analyticsKeys.all, 'overview', filters] as const,
  trends: (metric: string, filters: AnalyticsFilters) => [...analyticsKeys.all, 'trends', metric, filters] as const,
  breakdowns: (type: string, filters: AnalyticsFilters) => [...analyticsKeys.all, 'breakdowns', type, filters] as const,
  leaderboards: (type: string, filters: AnalyticsFilters) => [...analyticsKeys.all, 'leaderboards', type, filters] as const,
}

export function useAnalyticsOverview(filters: AnalyticsFilters) {
  const { can } = useSession()
  return useQuery({
    queryKey: analyticsKeys.overview(filters),
    queryFn: () => api.getOverview(filters),
    enabled: can('analytics', 'view') && !!filters.dateFrom && !!filters.dateTo,
  })
}

export function useAnalyticsTrends(metric: 'gmv' | 'orders_customers' | 'user_growth', filters: AnalyticsFilters) {
  const { can } = useSession()
  return useQuery({
    queryKey: analyticsKeys.trends(metric, filters),
    queryFn: () => api.getTrends(metric, filters),
    enabled: can('analytics', 'view') && !!filters.dateFrom && !!filters.dateTo,
  })
}

export function useAnalyticsBreakdowns(type: 'payment_method' | 'order_status' | 'settlement_status', filters: AnalyticsFilters) {
  const { can } = useSession()
  return useQuery({
    queryKey: analyticsKeys.breakdowns(type, filters),
    queryFn: () => api.getBreakdowns(type, filters),
    enabled: can('analytics', 'view') && !!filters.dateFrom && !!filters.dateTo,
  })
}

export function useAnalyticsLeaderboards(type: 'top_events' | 'top_organizers' | 'customers_by_city', filters: AnalyticsFilters & { limit?: number }) {
  const { can } = useSession()
  return useQuery({
    queryKey: analyticsKeys.leaderboards(type, filters),
    queryFn: () => api.getLeaderboards(type, filters),
    enabled: can('analytics', 'view') && !!filters.dateFrom && !!filters.dateTo,
  })
}

export function useDownloadReport() {
  return useMutation({
    mutationFn: (data: AnalyticsFilters & { format: 'pdf' | 'csv' }) => api.downloadReport(data),
  })
}
