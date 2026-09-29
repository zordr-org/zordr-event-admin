import { useQuery } from '@tanstack/react-query'
import { getDashboardSummary } from '@/lib/api/client'
import type { TimeRange } from './types'

export function useDashboardSummary(range: TimeRange) {
  return useQuery({
    queryKey: ['dashboardSummary', range],
    queryFn: () => getDashboardSummary(range),
    refetchInterval: 30000,
    placeholderData: (previousData) => previousData,
  })
}
