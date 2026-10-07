import { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { useRole, useCreateRole, useUpdateRole } from '../hooks'
import { createRoleSchema, updateRoleSchema } from '../schemas'
import type { Role, RolePermission } from '../types'
import { MODULES, type Module } from '@/types/auth'
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
import { Badge } from '@/components/ui/badge'

type FormValues = { name: string; description: string; permissions: RolePermission[] }

const PRESETS = {
  'Read-Only Observer': (module: string) => ({ canView: true, canCreate: false, canEdit: false, canDelete: false, canExport: false }),
  'Operations Manager': (module: string) => ({ canView: true, canCreate: true, canEdit: true, canDelete: false, canExport: true }),
  'Event Moderator': (module: string) => ({ canView: true, canCreate: false, canEdit: true, canDelete: false, canExport: false }),
  'Finance Specialist': (module: string) => {
    if (['orders', 'settlements', 'refunds', 'analytics'].includes(module)) {
      return { canView: true, canCreate: true, canEdit: true, canDelete: false, canExport: true }
    }
    return { canView: true, canCreate: false, canEdit: false, canDelete: false, canExport: false }
  },
}

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

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    watch,
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
    keyName: '_id',
  })

  const permissions = watch('permissions') || []

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
        await updateMutation.mutateAsync({
          id: roleId,
          data: { permissions: data.permissions },
        } as any)
      }
      onOpenChange(false)
    } catch (error) {
    }
  }

  const setAllPermissions = (value: boolean) => {
    MODULES.forEach((_, index) => {
      setValue(`permissions.${index}.canView`, value)
      setValue(`permissions.${index}.canCreate`, value)
      setValue(`permissions.${index}.canEdit`, value)
      setValue(`permissions.${index}.canDelete`, value)
      setValue(`permissions.${index}.canExport`, value)
    })
  }

  const applyPreset = (presetName: string) => {
    if (!presetName || !PRESETS[presetName as keyof typeof PRESETS]) return
    const generator = PRESETS[presetName as keyof typeof PRESETS]
    
    MODULES.forEach((module, index) => {
      const config = generator(module)
      setValue(`permissions.${index}.canView`, config.canView)
      setValue(`permissions.${index}.canCreate`, config.canCreate)
      setValue(`permissions.${index}.canEdit`, config.canEdit)
      setValue(`permissions.${index}.canDelete`, config.canDelete)
      setValue(`permissions.${index}.canExport`, config.canExport)
    })
  }

  const isSuperAdmin = !isNew && roleDetail?.name === 'Super Admin'
  const isNameReadonly = !isNew && roleDetail?.type === 'system'
  
  // Calculate stats
  const totalPossible = MODULES.length * 5
  let totalGranted = 0
  let exportGranted = 0
  let deleteGranted = 0
  
  permissions.forEach(p => {
    if (p.canView) totalGranted++
    if (p.canCreate) totalGranted++
    if (p.canEdit) totalGranted++
    if (p.canDelete) { totalGranted++; deleteGranted++ }
    if (p.canExport) { totalGranted++; exportGranted++ }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isNew ? 'Create Custom Role' : `Edit Role: ${roleDetail?.name || ''}`}</DialogTitle>
          <DialogDescription>
            {isNew
              ? 'Define a new set of permissions for your team.'
              : isSuperAdmin
              ? 'The Super Admin role permissions are fixed.'
              : 'Modify the permissions for this role. System roles can have permissions edited.'}
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
                    disabled={isNameReadonly}
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name?.message as string}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    {...register('description')}
                    placeholder="Brief description of this role"
                    disabled={isNameReadonly}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h3 className="text-sm font-medium">Permissions Matrix</h3>
                  <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                    <Badge variant="secondary">{totalGranted} / {totalPossible} granted</Badge>
                    {exportGranted > 0 && <Badge variant="outline" className="text-orange-500 border-orange-200 bg-orange-50">Can Export ({exportGranted})</Badge>}
                    {deleteGranted > 0 && <Badge variant="outline" className="text-destructive border-destructive/20 bg-destructive/10">Can Delete ({deleteGranted})</Badge>}
                  </div>
                </div>
                
                {!isSuperAdmin && (
                  <div className="flex items-center gap-2">
                    <select 
                      className="h-9 px-3 rounded-md border border-input bg-transparent text-sm"
                      onChange={(e) => applyPreset(e.target.value)}
                      defaultValue=""
                    >
                      <option value="" disabled>Apply Preset...</option>
                      {Object.keys(PRESETS).map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                    <Button type="button" variant="outline" size="sm" onClick={() => setAllPermissions(true)}>
                      Select All
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => setAllPermissions(false)}>
                      Deselect All
                    </Button>
                  </div>
                )}
              </div>

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
                            disabled={isSuperAdmin}
                            className="rounded border-input"
                          />
                        </td>
                        <td className="px-4 py-2 text-center">
                          <input
                            type="checkbox"
                            {...register(`permissions.${index}.canCreate`)}
                            disabled={isSuperAdmin}
                            className="rounded border-input"
                          />
                        </td>
                        <td className="px-4 py-2 text-center">
                          <input
                            type="checkbox"
                            {...register(`permissions.${index}.canEdit`)}
                            disabled={isSuperAdmin}
                            className="rounded border-input"
                          />
                        </td>
                        <td className="px-4 py-2 text-center">
                          <input
                            type="checkbox"
                            {...register(`permissions.${index}.canDelete`)}
                            disabled={isSuperAdmin}
                            className="rounded border-input"
                          />
                        </td>
                        <td className="px-4 py-2 text-center">
                          <input
                            type="checkbox"
                            {...register(`permissions.${index}.canExport`)}
                            disabled={isSuperAdmin}
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
                {isSuperAdmin ? 'Close' : 'Cancel'}
              </Button>
              {!isSuperAdmin && (
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
