import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getRolesApi } from './api'
import type { CreateRoleRequest, UpdateRoleRequest } from './types'
import { toast } from 'sonner'

export const ROLES_KEYS = {
  all: ['roles'] as const,
  list: () => [...ROLES_KEYS.all, 'list'] as const,
  detail: (id: string) => [...ROLES_KEYS.all, 'detail', id] as const,
}

export function useRoles() {
  return useQuery({
    queryKey: ROLES_KEYS.list(),
    queryFn: () => getRolesApi().getRoles(),
  })
}

export function useRole(id: string, enabled = true) {
  return useQuery({
    queryKey: ROLES_KEYS.detail(id),
    queryFn: () => getRolesApi().getRole(id),
    enabled: !!id && enabled,
  })
}

export function useCreateRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateRoleRequest) => getRolesApi().createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROLES_KEYS.all })
      toast.success('Role created successfully')
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create role')
    }
  })
}

export function useUpdateRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoleRequest }) => 
      getRolesApi().updateRole(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ROLES_KEYS.all })
      queryClient.invalidateQueries({ queryKey: ROLES_KEYS.detail(id) })
      toast.success('Role updated successfully')
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update role')
    }
  })
}

export function useDeleteRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => getRolesApi().deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROLES_KEYS.all })
      toast.success('Role deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete role')
    }
  })
}
