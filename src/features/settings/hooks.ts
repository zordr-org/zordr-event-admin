import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSettingsApi } from './api'
import type { UpdateSettingsRequest } from './types'
import { toast } from 'sonner'

export const SETTINGS_KEYS = {
  all: ['settings'] as const,
}

export function useSettings() {
  return useQuery({
    queryKey: SETTINGS_KEYS.all,
    queryFn: () => getSettingsApi().getSettings(),
  })
}

export function useUpdateSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateSettingsRequest) => getSettingsApi().updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS.all })
      toast.success('Settings updated successfully')
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update settings')
    }
  })
}
