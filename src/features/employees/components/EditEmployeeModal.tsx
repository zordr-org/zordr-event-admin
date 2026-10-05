import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useUpdateEmployee } from '../hooks'
import { editEmployeeSchema, type EditEmployeeFormData } from '../schemas'
import type { Employee } from '../types'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useSession } from '@/providers/SessionProvider'

export function EditEmployeeModal({
  employee,
  open,
  onOpenChange,
}: {
  employee: Employee | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const updateMutation = useUpdateEmployee()
  const { user } = useSession()
  const isSelf = user?.id === employee?.id

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EditEmployeeFormData>({
    resolver: zodResolver(editEmployeeSchema),
    defaultValues: {
      roleId: '',
      department: '',
      status: 'active',
    },
  })

  useEffect(() => {
    if (employee) {
      reset({
        roleId: employee.roleId,
        department: employee.department,
        status: employee.status === 'invited' ? 'active' : employee.status, // Can't select invited
      })
    }
  }, [employee, reset])

  const [confirmDeactivate, setConfirmDeactivate] = useState(false)
  const formStatus = watch('status')

  const onSubmit = async (data: EditEmployeeFormData) => {
    if (!employee) return
    
    // Require confirmation if deactivating
    if (employee.status === 'active' && data.status === 'inactive' && !confirmDeactivate) {
      setConfirmDeactivate(true)
      return
    }

    try {
      await updateMutation.mutateAsync({ id: employee.id, data })
      setConfirmDeactivate(false)
      onOpenChange(false)
    } catch (error) {
      // toast handled in hook
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setConfirmDeactivate(false)
    }
    onOpenChange(isOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Employee</DialogTitle>
          <DialogDescription>
            Update role, department, or status for {employee?.name}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-roleId">Role</Label>
              <select
                id="edit-roleId"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isSelf}
                {...register('roleId')}
              >
                <option value="">Select role...</option>
                <option value="role-1">Super Admin</option>
                <option value="role-2">Finance Executive</option>
                <option value="role-3">Support Executive</option>
                <option value="role-4">Marketing Executive</option>
                <option value="role-5">Operations Manager</option>
              </select>
              {errors.roleId && <p className="text-sm text-destructive">{errors.roleId.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-department">Department</Label>
              <select
                id="edit-department"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                {...register('department')}
              >
                <option value="">Select dept...</option>
                <option value="engineering">Engineering</option>
                <option value="finance">Finance</option>
                <option value="support">Support</option>
                <option value="marketing">Marketing</option>
                <option value="operations">Operations</option>
              </select>
              {errors.department && <p className="text-sm text-destructive">{errors.department.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-status">Status</Label>
            <select
              id="edit-status"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSelf || employee?.status === 'invited'}
              {...register('status')}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              {employee?.status === 'invited' && <option value="invited">Invited</option>}
            </select>
            {isSelf && <p className="text-xs text-muted-foreground">You cannot change your own status or role.</p>}
            {employee?.status === 'invited' && <p className="text-xs text-muted-foreground">Invited status can only change once accepted.</p>}
          </div>

          {confirmDeactivate && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              <strong>Warning:</strong> You are about to deactivate this employee. They will lose access immediately.
              Click save again to confirm.
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || updateMutation.isPending}>
              {isSubmitting ? 'Saving...' : confirmDeactivate ? 'Confirm Deactivate' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
