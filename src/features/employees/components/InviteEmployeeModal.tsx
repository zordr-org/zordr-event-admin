import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useInviteEmployee } from '../hooks'
import { inviteEmployeeSchema, type InviteEmployeeFormData } from '../schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

export function InviteEmployeeModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const inviteMutation = useInviteEmployee()
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<InviteEmployeeFormData>({
    resolver: zodResolver(inviteEmployeeSchema),
    defaultValues: { sendInvitation: true },
  })

  const onSubmit = async (data: InviteEmployeeFormData) => {
    try {
      await inviteMutation.mutateAsync(data)
      reset()
      onOpenChange(false)
    } catch (error: any) {
      if (error?.code === 'CONFLICT') {
        setError('email', { type: 'manual', message: error.message || 'Email already exists' })
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Employee</DialogTitle>
          <DialogDescription>
            Send an invitation to a new team member. The invite is a time-limited single-use link and no password is set.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register('name')} placeholder="e.g. John Doe" />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} placeholder="john@example.com" />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="roleId">Role</Label>
              <select
                id="roleId"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
              <Label htmlFor="department">Department</Label>
              <select
                id="department"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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

          <div className="flex items-center space-x-2 pt-2">
            {/* Can't easily use shadcn Checkbox with RHF without Controller, using native input or simple binding */}
            <input
              type="checkbox"
              id="sendInvitation"
              className="h-4 w-4 rounded border-input"
              {...register('sendInvitation')}
            />
            <Label htmlFor="sendInvitation">Send invitation email immediately</Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || inviteMutation.isPending}>
              {isSubmitting ? 'Inviting...' : 'Invite Employee'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
