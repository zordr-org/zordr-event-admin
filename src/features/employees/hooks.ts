import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getEmployeesApi } from './api'
import type { EmployeesFilters, InviteEmployeeRequest, UpdateEmployeeRequest } from './types'
import { toast } from 'sonner'

export const EMPLOYEES_KEYS = {
  all: ['employees'] as const,
  list: (filters: EmployeesFilters) => [...EMPLOYEES_KEYS.all, 'list', filters] as const,
}

export function useEmployees(filters: EmployeesFilters) {
  return useQuery({
    queryKey: EMPLOYEES_KEYS.list(filters),
    queryFn: () => getEmployeesApi().getEmployees(filters),
  })
}

export function useInviteEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: InviteEmployeeRequest) => getEmployeesApi().inviteEmployee(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEES_KEYS.all })
      toast.success('Employee invited successfully')
    },
    onError: (error: any) => {
      if (error?.code !== 'CONFLICT') {
        toast.error(error?.message || 'Failed to invite employee')
      }
    }
  })
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmployeeRequest }) => 
      getEmployeesApi().updateEmployee(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEES_KEYS.all })
      toast.success('Employee updated successfully')
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update employee')
    }
  })
}
