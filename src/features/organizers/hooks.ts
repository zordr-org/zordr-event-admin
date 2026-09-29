import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getOrganizersApi } from './api'
import type { 
  OrganizerFilters, 
  AddNoteFormValues, 
  RejectOrganizerFormValues, 
  SuspendOrganizerFormValues 
} from './types'

export const organizerKeys = {
  all: ['organizers'] as const,
  lists: () => [...organizerKeys.all, 'list'] as const,
  list: (filters: OrganizerFilters) => [...organizerKeys.lists(), filters] as const,
  kpis: () => [...organizerKeys.all, 'kpis'] as const,
  details: () => [...organizerKeys.all, 'detail'] as const,
  detail: (id: string) => [...organizerKeys.details(), id] as const,
}

export function useOrganizers(filters: OrganizerFilters) {
  return useQuery({
    queryKey: organizerKeys.list(filters),
    queryFn: () => getOrganizersApi().getOrganizers(filters),
    placeholderData: (previousData) => previousData, // keepPreviousData
  })
}

export function useOrganizerKpis() {
  return useQuery({
    queryKey: organizerKeys.kpis(),
    queryFn: () => getOrganizersApi().getOrganizerKpis(),
  })
}

export function useOrganizer(id: string) {
  return useQuery({
    queryKey: organizerKeys.detail(id),
    queryFn: () => getOrganizersApi().getOrganizer(id),
  })
}

export function useOrganizerActions() {
  const queryClient = useQueryClient()

  const invalidate = (id: string) => {
    queryClient.invalidateQueries({ queryKey: organizerKeys.detail(id) })
    queryClient.invalidateQueries({ queryKey: organizerKeys.lists() })
    queryClient.invalidateQueries({ queryKey: organizerKeys.kpis() })
  }

  const approve = useMutation({
    mutationFn: (id: string) => getOrganizersApi().approveOrganizer(id),
    onSuccess: (_, id) => invalidate(id)
  })

  const reject = useMutation({
    mutationFn: ({ id, data }: { id: string, data: RejectOrganizerFormValues }) => 
      getOrganizersApi().rejectOrganizer(id, data),
    onSuccess: (_, { id }) => invalidate(id)
  })

  const suspend = useMutation({
    mutationFn: ({ id, data }: { id: string, data: SuspendOrganizerFormValues }) => 
      getOrganizersApi().suspendOrganizer(id, data),
    onSuccess: (_, { id }) => invalidate(id)
  })

  return { approve, reject, suspend }
}

export function useAddNote(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AddNoteFormValues) => getOrganizersApi().addNote(id, data),
    onMutate: async (newNote) => {
      await queryClient.cancelQueries({ queryKey: organizerKeys.detail(id) })
      const previousData = queryClient.getQueryData(organizerKeys.detail(id))

      // Optimistic update
      queryClient.setQueryData(organizerKeys.detail(id), (old: any) => {
        if (!old) return old
        return {
          ...old,
          data: {
            ...old.data,
            organizer: {
              ...old.data.organizer,
              notes: [
                {
                  id: 'temp-id',
                  authorId: 'me',
                  authorName: 'Me',
                  note: newNote.note,
                  createdAt: new Date().toISOString()
                },
                ...old.data.organizer.notes
              ]
            }
          }
        }
      })

      return { previousData }
    },
    onError: (err, newNote, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(organizerKeys.detail(id), context.previousData)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: organizerKeys.detail(id) })
    }
  })
}
