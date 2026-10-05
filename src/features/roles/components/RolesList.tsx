'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/shell/PageHeader'
import { DataTable, type ColumnDef } from '@/components/shared/DataTable'
import { Button } from '@/components/ui/button'
import { useRoles, useDeleteRole } from '../hooks'
import type { Role } from '../types'
import { Can } from '@/components/shell/Can'
import { RoleEditorModal } from './RoleEditorModal'
import { TableSkeleton } from '@/components/shell/TableSkeleton'
import { EmptyState } from '@/components/shell/EmptyState'
import { ShieldPlus, ShieldAlert, Settings2, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

export function RolesList() {
  const { data, isLoading, error, refetch } = useRoles()
  const deleteMutation = useDeleteRole()

  const [activeRole, setActiveRole] = useState<Role | null | 'new'>(null)
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null)

  const handleDelete = async () => {
    if (!roleToDelete) return
    try {
      await deleteMutation.mutateAsync(roleToDelete.id)
      setRoleToDelete(null)
    } catch (e) {
      // hook handles toast
    }
  }

  const columns: ColumnDef<Role>[] = [
    {
      header: 'Role Name',
      accessorKey: 'name',
      cell: (role) => <span className="font-medium">{role.name}</span>
    },
    {
      header: 'Type',
      accessorKey: 'type',
      cell: (role) => (
        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
          role.type === 'system' ? 'bg-primary/10 text-primary' : 'bg-secondary text-secondary-foreground'
        }`}>
          {role.type === 'system' ? 'System Default' : 'Custom Role'}
        </span>
      )
    },
    {
      header: 'Assigned Employees',
      accessorKey: 'employeeCount',
      cell: (role) => (
        <span className="text-muted-foreground">{role.employeeCount} assigned</span>
      )
    },
    {
      header: '',
      accessorKey: 'id',
      cell: (role) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <Can module="roles" action="view">
                <DropdownMenuItem onClick={() => setActiveRole(role)}>
                  <Settings2 className="mr-2 h-4 w-4" /> {role.type === 'system' ? 'View permissions' : 'Edit permissions'}
                </DropdownMenuItem>
              </Can>
              
              {role.isDeletable && (
                <Can module="roles" action="delete">
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-destructive focus:text-destructive"
                    onClick={() => {
                      if (role.employeeCount > 0) {
                        toast.error('Cannot delete role with assigned employees. Reassign them first.')
                      } else {
                        setRoleToDelete(role)
                      }
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete role
                  </DropdownMenuItem>
                </Can>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }
  ]

  if (error) {
    return (
      <EmptyState
        title="Error loading roles"
        description="There was a problem fetching the roles list."
        action={{ label: 'Try again', onClick: () => refetch() }}
      />
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles & Permissions"
        description="Manage access levels and capabilities across the admin portal."
        action={
          <Can module="roles" action="create">
            <Button onClick={() => setActiveRole('new')}>
              <ShieldPlus className="mr-2 h-4 w-4" />
              Create Custom Role
            </Button>
          </Can>
        }
      />

      <div className="rounded-md border bg-card overflow-hidden">
        {isLoading ? (
          <TableSkeleton columns={4} rows={5} />
        ) : (
          <DataTable
            data={data?.data || []}
            columns={columns}
          />
        )}
      </div>

      {activeRole && (
        <RoleEditorModal
          role={activeRole}
          open={!!activeRole}
          onOpenChange={(open) => !open && setActiveRole(null)}
        />
      )}

      {/* Delete Confirmation */}
      <Dialog open={!!roleToDelete} onOpenChange={(open) => !open && setRoleToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center text-destructive">
              <ShieldAlert className="mr-2 h-5 w-5" />
              Delete Role
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the role <strong>{roleToDelete?.name}</strong>? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setRoleToDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Role'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
