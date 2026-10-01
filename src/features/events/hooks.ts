import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getEventsApi } from './api'
import type {
  EventFilters,
  UpdateChecklistItemValues,
  SendBackFormValues,
  RejectEventFormValues,
} from './types'

// ─── Query Key Factory ────────────────────────────────────────────────────────
export const eventKeys = {
  all: ['events'] as const,
  lists: () => [...eventKeys.all, 'list'] as const,
  list: (filters: EventFilters) => [...eventKeys.lists(), filters] as const,
  kpis: () => [...eventKeys.all, 'kpis'] as const,
  reviews: () => [...eventKeys.all, 'review'] as const,
  review: (id: string) => [...eventKeys.reviews(), id] as const,
  preview: (id: string) => [...eventKeys.all, 'preview', id] as const,
}

// ─── List ─────────────────────────────────────────────────────────────────────
export function useEvents(filters: EventFilters) {
  return useQuery({
    queryKey: eventKeys.list(filters),
    queryFn: () => getEventsApi().getEvents(filters),
    placeholderData: (previousData) => previousData,
  })
}

export function useEventKpis() {
  return useQuery({
    queryKey: eventKeys.kpis(),
    queryFn: () => getEventsApi().getEventKpis(),
  })
}

// ─── Review ───────────────────────────────────────────────────────────────────
export function useEventReview(id: string) {
  return useQuery({
    queryKey: eventKeys.review(id),
    queryFn: () => getEventsApi().getEventReview(id),
    enabled: !!id,
  })
}

export function usePreview(id: string) {
  return useQuery({
    queryKey: eventKeys.preview(id),
    queryFn: () => getEventsApi().getPreview(id),
    enabled: false, // triggered manually
  })
}

// ─── Checklist Update (per-item) ──────────────────────────────────────────────
export function useChecklistUpdate(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateChecklistItemValues) =>
      getEventsApi().updateChecklist(eventId, data),

    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: eventKeys.review(eventId) })
      const previous = queryClient.getQueryData(eventKeys.review(eventId))

      // Optimistic update
      queryClient.setQueryData(eventKeys.review(eventId), (old: any) => {
        if (!old) return old
        return {
          ...old,
          data: {
            ...old.data,
            review: {
              ...old.data.review,
              checklist: old.data.review.checklist.map((item: any) =>
                item.key === data.item
                  ? { ...item, status: data.status, comment: data.comment ?? item.comment }
                  : item
              ),
            },
          },
        }
      })

      return { previous }
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(eventKeys.review(eventId), context.previous)
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.review(eventId) })
    },
  })
}

// ─── Review Actions ───────────────────────────────────────────────────────────
function useInvalidateAll(eventId: string) {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: eventKeys.review(eventId) })
    queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
    queryClient.invalidateQueries({ queryKey: eventKeys.kpis() })
  }
}

export function useApproveEvent(eventId: string) {
  const invalidate = useInvalidateAll(eventId)
  return useMutation({
    mutationFn: () => getEventsApi().approveEvent(eventId),
    onSuccess: invalidate,
  })
}

export function useSendBack(eventId: string) {
  const invalidate = useInvalidateAll(eventId)
  return useMutation({
    mutationFn: (data: SendBackFormValues) => getEventsApi().sendBack(eventId, data),
    onSuccess: invalidate,
  })
}

export function useRejectEvent(eventId: string) {
  const invalidate = useInvalidateAll(eventId)
  return useMutation({
    mutationFn: (data: RejectEventFormValues) => getEventsApi().rejectEvent(eventId, data),
    onSuccess: invalidate,
  })
}
