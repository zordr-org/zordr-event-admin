import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCustomersApi } from './api'
import type { CustomersFilters, BlockCustomerRequest } from './types'

export const customersKeys = {
  all: ['customers'] as const,
  lists: () => [...customersKeys.all, 'list'] as const,
  list: (filters: CustomersFilters) => [...customersKeys.lists(), filters] as const,
  kpis: () => [...customersKeys.all, 'kpis'] as const,
}

export function useCustomers(filters: CustomersFilters) {
  return useQuery({
    queryKey: customersKeys.list(filters),
    queryFn: () => getCustomersApi().getCustomers(filters),
  })
}

export function useCustomersKpis() {
  return useQuery({
    queryKey: customersKeys.kpis(),
    queryFn: () => getCustomersApi().getCustomersKpis(),
  })
}

export function useBlockCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BlockCustomerRequest }) => getCustomersApi().blockCustomer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customersKeys.all })
    },
  })
}

export function useUnblockCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => getCustomersApi().unblockCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customersKeys.all })
    },
  })
}
