import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSupportApi } from './api'
import type { SupportFilters, ReplyTicketRequest } from './types'
import { useSession } from '@/providers/SessionProvider'

const api = getSupportApi()

export const supportKeys = {
  all: ['support'] as const,
  lists: () => [...supportKeys.all, 'list'] as const,
  list: (filters: SupportFilters) => [...supportKeys.lists(), filters] as const,
  kpis: () => [...supportKeys.all, 'kpis'] as const,
  thread: (id: string) => [...supportKeys.all, 'thread', id] as const,
}

export function useSupportTickets(filters: SupportFilters) {
  const { can } = useSession()
  return useQuery({
    queryKey: supportKeys.list(filters),
    queryFn: () => api.getTickets(filters),
    enabled: can('support', 'view'),
  })
}

export function useSupportKpis() {
  const { can } = useSession()
  return useQuery({
    queryKey: supportKeys.kpis(),
    queryFn: () => api.getSupportKpis(),
    enabled: can('support', 'view'),
  })
}

export function useSupportThread(id: string | undefined) {
  const { can } = useSession()
  return useQuery({
    queryKey: supportKeys.thread(id!),
    queryFn: () => api.getTicketThread(id!),
    enabled: !!id && can('support', 'view'),
  })
}

export function useReplyTicket() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReplyTicketRequest }) => api.replyTicket(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: supportKeys.lists() })
      queryClient.invalidateQueries({ queryKey: supportKeys.kpis() })
      queryClient.invalidateQueries({ queryKey: supportKeys.thread(variables.id) })
    },
  })
}
