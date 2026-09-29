'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Users, UserCheck, Clock, XCircle, Ban, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PageHeader } from '@/components/shell/PageHeader'
import { StatusBadge } from '@/components/shell/StatusBadge'
import { EmptyState } from '@/components/shell/EmptyState'
import { FilterBar } from '@/components/shared/FilterBar'
import { DataTable, type ColumnDef } from '@/components/shared/DataTable'
import { KpiStrip, type KpiItem } from '@/components/shared/KpiStrip'
import { useUrlState } from '@/hooks/useUrlState'
import { useOrganizers, useOrganizerKpis, useOrganizerActions } from '../hooks'
import type { OrganizerList, OrganizerStatus, KycStatus } from '../types'
import { getAvailableActions } from '../lib/status'

const CITIES = ['Hyderabad', 'Bangalore', 'Mumbai', 'Delhi', 'Chennai', 'Pune']

export function OrganizersList() {
  const router = useRouter()
  const { state: filters, setUrlState, clearState } = useUrlState({
    page: 1,
    limit: 10,
    q: '',
    status: undefined as OrganizerStatus | undefined,
    kyc: undefined as KycStatus | undefined,
    city: ''
  })

  const { data: listData, isLoading, isError, refetch } = useOrganizers(filters)
  const { data: kpis, isLoading: kpisLoading } = useOrganizerKpis()
  const actions = useOrganizerActions()

  const kpiItems: KpiItem[] = React.useMemo(() => [
    {
      id: 'total',
      label: 'Total Organizers',
      value: kpis?.total ?? 0,
      icon: <Users className="w-5 h-5" />,
      delta: '12%',
      trend: 'up'
    },
    {
      id: 'approved',
      label: 'Approved',
      value: kpis?.approved ?? 0,
      icon: <UserCheck className="w-5 h-5 text-emerald-600" />,
      sub: '75% of total'
    },
    {
      id: 'pending',
      label: 'Pending',
      value: kpis?.pending ?? 0,
      icon: <Clock className="w-5 h-5 text-amber-600" />,
      delta: '20%',
      trend: 'down',
      inverseTrendColor: true,
      sub: 'awaiting review'
    },
    {
      id: 'rejected',
      label: 'Rejected',
      value: kpis?.rejected ?? 0,
      icon: <XCircle className="w-5 h-5 text-red-600" />,
      sub: '4% of total'
    },
    {
      id: 'blocked',
      label: 'Blocked',
      value: kpis?.blocked ?? 0,
      icon: <Ban className="w-5 h-5 text-red-600" />,
      sub: '4% of total'
    }
  ], [kpis])

  const columns = React.useMemo<ColumnDef<OrganizerList>[]>(() => [
    {
      header: 'Organizer',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={row.avatarUrl} />
            <AvatarFallback className="bg-primary/10 text-primary uppercase">
              {row.orgName.substring(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium text-sm leading-none">{row.orgName}</span>
            {row.handle && <span className="text-xs text-muted-foreground mt-1">{row.handle}</span>}
          </div>
        </div>
      )
    },
    { header: 'City', accessorKey: 'city' },
    { header: 'Phone', accessorKey: 'phone' },
    { header: 'Email', accessorKey: 'email' },
    {
      header: 'KYC Status',
      cell: (row) => <StatusBadge status={row.kycStatus === 'not_submitted' ? 'Not Submitted' : row.kycStatus} />
    },
    { header: 'Active Events', accessorKey: 'activeEvents', className: 'text-right' },
    { 
      header: 'Total Revenue', 
      cell: (row) => `₹${row.totalRevenue.toLocaleString()}`,
      className: 'text-right'
    },
    {
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status === 'suspended' ? 'Blocked' : row.status} />
    },
    {
      header: 'Joined On',
      cell: (row) => new Date(row.joinedOn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    },
    {
      header: 'Actions',
      cell: (row) => {
        const available = getAvailableActions(row.status)
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/organizers/${row.id}`)}>
                View
              </DropdownMenuItem>
              {/* Other actions handled via dialogs or detail page */}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
    }
  ], [router])

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Organizers"
        description="Manage organizers, track their status, and oversee their events."
        action={<Button>+ Add Organizer</Button>}
      />

      <KpiStrip items={kpiItems} isLoading={kpisLoading} />

      <FilterBar 
        searchQuery={filters.q}
        onSearchChange={(q) => setUrlState({ q, page: 1 })}
        placeholder="Search by name, email or phone..."
        onReset={clearState}
      >
        <select 
          className="h-10 px-3 rounded-md border border-input bg-transparent text-sm"
          value={filters.status || ''}
          onChange={(e) => setUrlState({ status: e.target.value as OrganizerStatus || undefined, page: 1 })}
        >
          <option value="">All Status</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
          <option value="suspended">Blocked</option>
        </select>
        
        <select 
          className="h-10 px-3 rounded-md border border-input bg-transparent text-sm"
          value={filters.kyc || ''}
          onChange={(e) => setUrlState({ kyc: e.target.value as KycStatus || undefined, page: 1 })}
        >
          <option value="">All KYC Status</option>
          <option value="verified">Verified</option>
          <option value="pending">Pending</option>
          <option value="not_submitted">Not Submitted</option>
          <option value="rejected">Rejected</option>
        </select>

        <select 
          className="h-10 px-3 rounded-md border border-input bg-transparent text-sm"
          value={filters.city || ''}
          onChange={(e) => setUrlState({ city: e.target.value || undefined, page: 1 })}
        >
          <option value="">All Cities</option>
          {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </FilterBar>

      <DataTable
        columns={columns}
        data={listData?.data.organizers ?? []}
        isLoading={isLoading}
        isError={isError}
        emptyState={
          <EmptyState
            title="No organizers found"
            description="No organizers match your filters."
            action={{ label: "Clear filters", onClick: clearState }}
          />
        }
        errorState={
          <div className="text-center p-8">
            <p className="text-destructive font-medium">Failed to load organizers.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>Retry</Button>
          </div>
        }
      />
      
      {listData?.data.pagination && (
        <div className="flex items-center justify-between text-sm text-muted-foreground mt-4">
          <div>
            Showing {(listData.data.pagination.page - 1) * listData.data.pagination.limit + 1}-
            {Math.min(listData.data.pagination.page * listData.data.pagination.limit, listData.data.pagination.total)} of {listData.data.pagination.total} organizers
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
    </div>
  )
}
