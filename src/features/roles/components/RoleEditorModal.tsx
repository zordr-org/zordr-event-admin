import { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { useRole, useCreateRole, useUpdateRole } from '../hooks'
import { createRoleSchema, updateRoleSchema, type CreateRoleFormData, type UpdateRoleFormData } from '../schemas'
import type { Role } from '../types'
import { MODULES } from '@/types/auth'
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
import { Skeleton } from '@/components/ui/skeleton'

export function RoleEditorModal({
  role,
  open,
  onOpenChange,
}: {
  role: Role | null | 'new'
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const isNew = role === 'new'
  const roleId = role !== 'new' && role ? role.id : ''

  const { data: roleDetailData, isLoading: isLoadingDetail } = useRole(roleId, !isNew && !!roleId)
  const roleDetail = roleDetailData?.data

  const createMutation = useCreateRole()
  const updateMutation = useUpdateRole()

  // Use CreateRoleFormData as the base type (superset of UpdateRoleFormData)
  type FormValues = { name: string; description: string; permissions: Array<{ module: string; canView: boolean; canCreate: boolean; canEdit: boolean; canDelete: boolean; canExport: boolean }> }

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(isNew ? createRoleSchema : updateRoleSchema),
    defaultValues: {
      name: '',
      description: '',
      permissions: MODULES.map((module) => ({
        module,
        canView: false,
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canExport: false,
      })),
    },
  })

  const { fields } = useFieldArray({
    control,
    name: 'permissions',
    keyName: '_id', // so we don't conflict with any `id` on the object
  })

  useEffect(() => {
    if (isNew) {
      reset({
        name: '',
        description: '',
        permissions: MODULES.map((module) => ({
          module,
          canView: false,
          canCreate: false,
          canEdit: false,
          canDelete: false,
          canExport: false,
        })),
      })
    } else if (roleDetail) {
      reset({
        name: roleDetail.name,
        description: roleDetail.description || '',
        permissions: MODULES.map((module) => {
          const existing = roleDetail.permissions.find((p) => p.module === module)
          return existing || {
            module,
            canView: false,
            canCreate: false,
            canEdit: false,
            canDelete: false,
            canExport: false,
          }
        }),
      })
    }
  }, [isNew, roleDetail, reset])

  const onSubmit = async (data: any) => {
    try {
      if (isNew) {
        await createMutation.mutateAsync(data)
      } else {
        // Exclude name and description for update as per schema
        await updateMutation.mutateAsync({
          id: roleId,
          data: { permissions: data.permissions },
        })
      }
      onOpenChange(false)
    } catch (error) {
      // toast handled in hook
    }
  }

  // System roles can't edit permissions except maybe viewing them. Wait, "system" roles usually aren't editable, but the contract says isDeletable. Let's make "system" roles readonly for permissions.
  const isReadonly = !isNew && roleDetail?.type === 'system'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isNew ? 'Create Custom Role' : `Edit Role: ${roleDetail?.name || ''}`}</DialogTitle>
          <DialogDescription>
            {isNew
              ? 'Define a new set of permissions for your team.'
              : isReadonly
              ? 'System roles have fixed permissions and cannot be modified.'
              : 'Modify the permissions for this custom role.'}
          </DialogDescription>
        </DialogHeader>

        {(!isNew && isLoadingDetail) ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Role Name</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="e.g. Content Reviewer"
                    disabled={!isNew}
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name?.message as string}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    {...register('description')}
                    placeholder="Brief description of this role"
                    disabled={!isNew}
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-4">Permissions Matrix</h3>
              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-2 font-medium">Module</th>
                      <th className="px-4 py-2 font-medium text-center">View</th>
                      <th className="px-4 py-2 font-medium text-center">Create</th>
                      <th className="px-4 py-2 font-medium text-center">Edit</th>
                      <th className="px-4 py-2 font-medium text-center">Delete</th>
                      <th className="px-4 py-2 font-medium text-center">Export</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {fields.map((field, index) => (
                      <tr key={field._id} className="hover:bg-muted/50">
                        <td className="px-4 py-2 capitalize font-medium">{MODULES[index]}</td>
                        <td className="px-4 py-2 text-center">
                          <input
                            type="checkbox"
                            {...register(`permissions.${index}.canView`)}
                            disabled={isReadonly}
                            className="rounded border-input"
                          />
                        </td>
                        <td className="px-4 py-2 text-center">
                          <input
                            type="checkbox"
                            {...register(`permissions.${index}.canCreate`)}
                            disabled={isReadonly}
                            className="rounded border-input"
                          />
                        </td>
                        <td className="px-4 py-2 text-center">
                          <input
                            type="checkbox"
                            {...register(`permissions.${index}.canEdit`)}
                            disabled={isReadonly}
                            className="rounded border-input"
                          />
                        </td>
                        <td className="px-4 py-2 text-center">
                          <input
                            type="checkbox"
                            {...register(`permissions.${index}.canDelete`)}
                            disabled={isReadonly}
                            className="rounded border-input"
                          />
                        </td>
                        <td className="px-4 py-2 text-center">
                          <input
                            type="checkbox"
                            {...register(`permissions.${index}.canExport`)}
                            disabled={isReadonly}
                            className="rounded border-input"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {isReadonly ? 'Close' : 'Cancel'}
              </Button>
              {!isReadonly && (
                <Button type="submit" disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}>
                  {isSubmitting ? 'Saving...' : 'Save Role'}
                </Button>
              )}
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
