import { useQuery } from '@tanstack/react-query'
import { getDashboardApi } from './api'
import type { TimeRange } from './types'

export function useDashboardSummary(range: TimeRange) {
  return useQuery({
    queryKey: ['dashboardSummary', range],
    queryFn: () => getDashboardApi().getSummary(range),
    refetchInterval: 30000,
    placeholderData: (previousData) => previousData,
  })
}
