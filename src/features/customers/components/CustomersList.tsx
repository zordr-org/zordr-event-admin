'use client'

import * as React from 'react'
import { Users, UserCheck, UserPlus, Repeat, UserX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shell/PageHeader'
import { StatusBadge } from '@/components/shell/StatusBadge'
import { EmptyState } from '@/components/shell/EmptyState'
import { FilterBar } from '@/components/shared/FilterBar'
import { DataTable, type ColumnDef } from '@/components/shared/DataTable'
import { KpiStrip, type KpiItem } from '@/components/shared/KpiStrip'
import { Can } from '@/components/shell/Can'
import { useUrlState } from '@/hooks/useUrlState'
import { useCustomers, useCustomersKpis, useBlockCustomer, useUnblockCustomer } from '../hooks'
import { formatInr } from '@/lib/format'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { toast } from 'sonner'
import type { CustomerListItem, CustomerStatus } from '../types'

export function CustomersList() {
  const { state: filters, setUrlState, clearState } = useUrlState({
    page: 1,
    limit: 15,
    q: '',
    status: undefined as CustomerStatus | undefined,
    city: '',
    dateFrom: '',
    dateTo: '',
  })

  const { data: listData, isLoading, isError, refetch } = useCustomers(filters)
  const { data: kpis, isLoading: kpisLoading } = useCustomersKpis()
  
  const blockMutation = useBlockCustomer()
  const unblockMutation = useUnblockCustomer()
  
  const [blockDialogOpen, setBlockDialogOpen] = React.useState(false)
  const [selectedCustomerId, setSelectedCustomerId] = React.useState<string | null>(null)

  const kpiItems: KpiItem[] = React.useMemo(() => [
    { id: 'total', label: 'Total Customers', value: kpis?.totalCustomers ?? 0, icon: <Users className="w-5 h-5 text-blue-600" /> },
    { id: 'active', label: 'Active', value: kpis?.activeCustomers ?? 0, icon: <UserCheck className="w-5 h-5 text-emerald-600" /> },
    { id: 'new', label: 'New This Month', value: kpis?.newThisMonth ?? 0, icon: <UserPlus className="w-5 h-5 text-purple-600" /> },
    { id: 'repeat', label: 'Repeat', value: kpis?.repeatCustomers ?? 0, icon: <Repeat className="w-5 h-5 text-amber-600" /> },
    { id: 'blocked', label: 'Blocked', value: kpis?.blockedCustomers ?? 0, icon: <UserX className="w-5 h-5 text-red-600" /> },
  ], [kpis])

  const handleBlockAction = React.useCallback((id: string) => {
    setSelectedCustomerId(id)
    setBlockDialogOpen(true)
  }, [])

  const handleUnblockAction = React.useCallback((id: string) => {
    unblockMutation.mutate(id, {
      onSuccess: () => {
        toast.success('Customer unblocked successfully')
      },
      onError: () => {
        toast.error('Failed to unblock customer')
      }
    })
  }, [unblockMutation])

  const onConfirmBlock = (reason?: string) => {
    if (!selectedCustomerId || !reason) return
    blockMutation.mutate(
      { id: selectedCustomerId, data: { reason } },
      {
        onSuccess: () => {
          toast.success('Customer blocked successfully')
          setBlockDialogOpen(false)
          setSelectedCustomerId(null)
        },
        onError: () => {
          toast.error('Failed to block customer')
        }
      }
    )
  }

  const columns = React.useMemo<ColumnDef<CustomerListItem>[]>(() => [
    {
      header: 'Name',
      accessorKey: 'name',
      className: 'font-medium',
    },
    {
      header: 'Email',
      accessorKey: 'email',
    },
    {
      header: 'City',
      accessorKey: 'city',
    },
    {
      header: 'Events Attended',
      accessorKey: 'eventsAttended',
      className: 'text-right'
    },
    {
      header: 'Lifetime Spend',
      cell: (row) => <span className="font-medium">{formatInr(row.lifetimeSpend, true)}</span>,
      className: 'text-right'
    },
    {
      header: 'Last Order',
      cell: (row) => <span className="text-sm text-muted-foreground">{row.lastOrderId || 'N/A'}</span>,
    },
    {
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Joined On',
      cell: (row) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {new Date(row.joinedOn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      ),
    },
    {
      header: 'Actions',
      cell: (row) => (
        <Can module="customers" action="edit">
          {row.status === 'active' ? (
            <Button size="sm" variant="destructive" onClick={() => handleBlockAction(row.id)}>
              Block
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={() => handleUnblockAction(row.id)}>
              Unblock
            </Button>
          )}
        </Can>
      ),
      className: 'text-right'
    }
  ], [handleBlockAction, handleUnblockAction])

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Customers"
        description="View and manage customers, and their access."
      />

      <KpiStrip items={kpiItems} isLoading={kpisLoading} />

      <FilterBar
        searchQuery={filters.q}
        onSearchChange={(q) => setUrlState({ q, page: 1 })}
        placeholder="Search name, email..."
        onReset={clearState}
      >
        <select
          className="h-10 px-3 rounded-md border border-input bg-transparent text-sm"
          value={filters.status ?? ''}
          onChange={(e) => setUrlState({ status: (e.target.value || undefined) as CustomerStatus, page: 1 })}
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
        </select>

        <select
          className="h-10 px-3 rounded-md border border-input bg-transparent text-sm"
          value={filters.city ?? ''}
          onChange={(e) => setUrlState({ city: (e.target.value || undefined), page: 1 })}
        >
          <option value="">All Cities</option>
          <option value="Mumbai">Mumbai</option>
          <option value="Delhi">Delhi</option>
          <option value="Bangalore">Bangalore</option>
          <option value="Hyderabad">Hyderabad</option>
          <option value="Chennai">Chennai</option>
          <option value="Pune">Pune</option>
        </select>

        <div className="flex gap-2 items-center text-sm">
          <input 
            type="date" 
            className="h-10 px-3 rounded-md border border-input bg-transparent text-sm w-32" 
            value={filters.dateFrom ?? ''} 
            onChange={(e) => setUrlState({ dateFrom: e.target.value || undefined, page: 1 })} 
          />
          <span className="text-muted-foreground">-</span>
          <input 
            type="date" 
            className="h-10 px-3 rounded-md border border-input bg-transparent text-sm w-32" 
            value={filters.dateTo ?? ''} 
            onChange={(e) => setUrlState({ dateTo: e.target.value || undefined, page: 1 })} 
          />
        </div>
      </FilterBar>

      <DataTable
        columns={columns}
        data={listData?.data.customers ?? []}
        isLoading={isLoading}
        isError={isError}
        emptyState={
          <EmptyState
            title="No customers found"
            description="No customers match your current filters."
            action={{ label: 'Clear filters', onClick: clearState }}
          />
        }
        errorState={
          <div className="text-center p-8">
            <p className="text-destructive font-medium">Failed to load customers.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>Retry</Button>
          </div>
        }
      />

      {listData?.data.pagination && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>
            Showing {(listData.data.pagination.page - 1) * listData.data.pagination.limit + 1}–
            {Math.min(listData.data.pagination.page * listData.data.pagination.limit, listData.data.pagination.total)} of{' '}
            {listData.data.pagination.total} customers
          </div>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={listData.data.pagination.page <= 1}
              onClick={() => setUrlState({ page: listData.data.pagination.page - 1 })}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={listData.data.pagination.page >= listData.data.pagination.totalPages}
              onClick={() => setUrlState({ page: listData.data.pagination.page + 1 })}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={blockDialogOpen}
        onOpenChange={setBlockDialogOpen}
        title="Block Customer"
        description="Are you sure you want to block this customer? They will be prevented from completing new checkouts platform-wide."
        confirmText="Block Customer"
        requireReason={true}
        isDestructive={true}
        isLoading={blockMutation.isPending}
        onConfirm={onConfirmBlock}
      />
    </div>
  )
}
