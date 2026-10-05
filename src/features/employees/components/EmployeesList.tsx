'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/shell/PageHeader'
import { DataTable, type ColumnDef } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shell/StatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useEmployees } from '../hooks'
import type { Employee } from '../types'
import { Can } from '@/components/shell/Can'
import { InviteEmployeeModal } from './InviteEmployeeModal'
import { EditEmployeeModal } from './EditEmployeeModal'
import { TableSkeleton } from '@/components/shell/TableSkeleton'
import { EmptyState } from '@/components/shell/EmptyState'
import { formatRelativeTime } from '@/lib/format'
import { Search, UserPlus, MoreHorizontal, Settings2, Mail, MailX, Users } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { useDebounce } from '@/hooks/useDebounce'
import Link from 'next/link'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export function EmployeesList() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [roleId, setRoleId] = useState('')
  const [status, setStatus] = useState<Employee['status'] | ''>('')
  
  const debouncedSearch = useDebounce(search, 300)
  
  const { data, isLoading, error, refetch } = useEmployees({
    page,
    limit: 20,
    search: debouncedSearch,
    ...(roleId && { roleId }),
    ...(status && { status: status as Employee['status'] }),
  })

  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null)

  const columns: ColumnDef<Employee>[] = [
    {
      header: 'Employee',
      accessorKey: 'name',
      cell: (employee) => (
        <div>
          <p className="font-medium">{employee.name}</p>
          <p className="text-xs text-muted-foreground">{employee.email}</p>
        </div>
      )
    },
    {
      header: 'Role',
      accessorKey: 'role',
      cell: (employee) => (
        <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
          {employee.role}
        </span>
      )
    },
    {
      header: 'Department',
      accessorKey: 'department',
      cell: (employee) => (
        <span className="capitalize">{employee.department}</span>
      )
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (employee) => {
        let variant: 'success' | 'warning' | 'destructive' | 'default' = 'default'
        if (employee.status === 'active') variant = 'success'
        if (employee.status === 'inactive') variant = 'destructive'
        if (employee.status === 'invited') variant = 'warning'
        return <StatusBadge status={employee.status} variant={variant} />
      }
    },
    {
      header: 'Last Active',
      accessorKey: 'lastActiveAt',
      cell: (employee) => (
        <span className="text-muted-foreground text-sm">
          {employee.lastActiveAt ? formatRelativeTime(new Date(employee.lastActiveAt)) : 'Never'}
        </span>
      )
    },
    {
      header: '',
      accessorKey: 'id',
      cell: (employee) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <Can module="employees" action="edit">
                <DropdownMenuItem onClick={() => setEditEmployee(employee)}>
                  <Settings2 className="mr-2 h-4 w-4" /> Edit details
                </DropdownMenuItem>
              </Can>
              
              {employee.status === 'invited' && (
                <Can module="employees" action="edit">
                  <DropdownMenuSeparator />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <DropdownMenuItem disabled>
                            <Mail className="mr-2 h-4 w-4" /> Resend invite
                          </DropdownMenuItem>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>Backend support pending</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <DropdownMenuItem disabled className="text-destructive">
                            <MailX className="mr-2 h-4 w-4" /> Revoke invite
                          </DropdownMenuItem>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>Backend support pending</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
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
        title="Error loading employees"
        description="There was a problem fetching the employees list."
        action={{ label: 'Try again', onClick: () => refetch() }}
      />
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employees"
        description="Manage internal team access and roles."
        action={
          <div className="flex items-center gap-2">
            <Can module="employees" action="view">
              <Button variant="outline" asChild>
                <Link href="/roles">
                  <Users className="mr-2 h-4 w-4" />
                  Manage roles
                </Link>
              </Button>
            </Can>
            <Can module="employees" action="create">
              <Button onClick={() => setIsInviteOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite employee
              </Button>
            </Can>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-3 p-4 bg-card rounded-md border">
        <div className="relative flex-1 min-w-[200px] max-w-[400px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 ml-auto">
          <select
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
            className="h-10 px-3 rounded-md border border-input bg-transparent text-sm"
          >
            <option value="">All Roles</option>
            <option value="role-1">Super Admin</option>
            <option value="role-2">Finance Executive</option>
            <option value="role-3">Support Executive</option>
            <option value="role-4">Marketing Executive</option>
            <option value="role-5">Operations Manager</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="h-10 px-3 rounded-md border border-input bg-transparent text-sm"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="invited">Invited</option>
            <option value="inactive">Inactive</option>
          </select>
          
          {(search || roleId || status) && (
            <Button
              variant="ghost"
              className="text-sm font-medium text-primary hover:underline px-2 h-auto py-1"
              onClick={() => {
                setSearch('')
                setRoleId('')
                setStatus('')
              }}
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-md border bg-card overflow-hidden">
        {isLoading ? (
          <TableSkeleton columns={6} rows={5} />
        ) : (
          <DataTable
            data={data?.data.employees || []}
            columns={columns}
            pagination={{
              page,
              limit: 20,
              total: data?.data.pagination.total || 0,
              totalPages: data?.data.pagination.totalPages || 0,
              onPageChange: setPage,
            }}
          />
        )}
      </div>

      {isInviteOpen && (
        <InviteEmployeeModal open={isInviteOpen} onOpenChange={setIsInviteOpen} />
      )}
      
      {editEmployee && (
        <EditEmployeeModal
          employee={editEmployee}
          open={!!editEmployee}
          onOpenChange={(open) => !open && setEditEmployee(null)}
        />
      )}
    </div>
  )
}
