import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getOrdersApi } from './api'
import type { OrdersFilters, BulkActionRequest } from './types'

export const ordersKeys = {
  all: ['orders'] as const,
  lists: () => [...ordersKeys.all, 'list'] as const,
  list: (filters: OrdersFilters) => [...ordersKeys.lists(), filters] as const,
  kpis: () => [...ordersKeys.all, 'kpis'] as const,
}

export function useOrders(filters: OrdersFilters) {
  return useQuery({
    queryKey: ordersKeys.list(filters),
    queryFn: () => getOrdersApi().getOrders(filters),
  })
}

export function useOrdersKpis() {
  return useQuery({
    queryKey: ordersKeys.kpis(),
    queryFn: () => getOrdersApi().getOrdersKpis(),
  })
}

export function useBulkAction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: BulkActionRequest) => getOrdersApi().bulkAction(data),
    onSuccess: () => {
      // Invalidate both lists and kpis after a bulk action (like refund)
      queryClient.invalidateQueries({ queryKey: ordersKeys.all })
    },
  })
}
