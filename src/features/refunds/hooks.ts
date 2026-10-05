import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getRefundsApi } from './api'
import type { RefundsFilters, ReviewRefundRequest } from './types'
import { toast } from 'sonner'

export const refundsKeys = {
  all: ['refunds'] as const,
  lists: () => [...refundsKeys.all, 'list'] as const,
  list: (filters: RefundsFilters) => [...refundsKeys.lists(), filters] as const,
  kpis: () => [...refundsKeys.all, 'kpis'] as const,
}

export function useRefunds(filters: RefundsFilters) {
  return useQuery({
    queryKey: refundsKeys.list(filters),
    queryFn: () => getRefundsApi().getRefunds(filters),
  })
}

export function useRefundsKpis() {
  return useQuery({
    queryKey: refundsKeys.kpis(),
    queryFn: () => getRefundsApi().getRefundsKpis(),
  })
}

export function useReviewRefund() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReviewRefundRequest }) =>
      getRefundsApi().reviewRefund(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: refundsKeys.all })
      queryClient.invalidateQueries({ queryKey: ['settlements'] }) // Since it affects settlements
      toast.success('Refund reviewed successfully.')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to review refund.')
    },
  })
}
