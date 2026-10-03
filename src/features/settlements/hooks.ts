import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSettlementsApi } from './api'
import type { 
  SettlementsFilters, 
  GenerateSettlementRequest
} from './types'
import type {
  HoldSettlementInput,
  MarkPaidSettlementInput
} from './schemas'

const api = getSettlementsApi()

export const settlementsKeys = {
  all: ['settlements'] as const,
  lists: () => [...settlementsKeys.all, 'list'] as const,
  list: (filters: SettlementsFilters) => [...settlementsKeys.lists(), filters] as const,
  kpis: () => [...settlementsKeys.all, 'kpis'] as const,
}

export function useSettlements(filters: SettlementsFilters) {
  return useQuery({
    queryKey: settlementsKeys.list(filters),
    queryFn: () => api.getSettlements(filters),
  })
}

export function useSettlementsKpis() {
  return useQuery({
    queryKey: settlementsKeys.kpis(),
    queryFn: () => api.getSettlementsKpis(),
  })
}

export function useGenerateSettlement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: GenerateSettlementRequest) => api.generateSettlement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settlementsKeys.all })
    },
  })
}

export function useHoldSettlement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string } & HoldSettlementInput) => api.holdSettlement(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settlementsKeys.all })
    },
  })
}

export function useMarkPaidSettlement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: MarkPaidSettlementInput }) => api.markPaidSettlement(id, data.transferReference, data.transferDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settlementsKeys.all })
    },
  })
}

export function useExportSettlements() {
  return useMutation({
    mutationFn: ({ filters, format }: { filters: SettlementsFilters, format: 'csv' | 'pdf' }) => api.exportSettlements(filters, format),
  })
}
