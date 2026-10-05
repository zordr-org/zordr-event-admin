'use client'

import * as React from 'react'
import { DataTable, type ColumnDef } from '@/components/shared/DataTable'
import { KpiStrip } from '@/components/shared/KpiStrip'
import { StatusBadge } from '@/components/shell/StatusBadge'
import { Button } from '@/components/ui/button'
import { FilterBar } from '@/components/shared/FilterBar'
import { useUrlState } from '@/hooks/useUrlState'
import { useSupportTickets, useSupportKpis } from '../hooks'
import type { SupportTicketListItem, TicketStatus, TicketCategory, TicketPriority, RequesterType } from '../types'
import { SupportDetailModal } from './SupportDetailModal'

export function SupportList() {
  const { state: params, setUrlState: setParams, clearState } = useUrlState({
    page: 1,
    limit: 20,
    status: '' as TicketStatus | '',
    category: '' as TicketCategory | '',
    priority: '' as TicketPriority | '',
    requesterType: '' as RequesterType | '',
    search: '',
  })

  const [selectedTicket, setSelectedTicket] = React.useState<SupportTicketListItem | null>(null)
  const [modalOpen, setModalOpen] = React.useState(false)

  const filters = React.useMemo(() => ({
    page: params.page,
    limit: params.limit,
    ...(params.status ? { status: params.status as TicketStatus } : {}),
    ...(params.category ? { category: params.category as TicketCategory } : {}),
    ...(params.priority ? { priority: params.priority as TicketPriority } : {}),
    ...(params.requesterType ? { requesterType: params.requesterType as RequesterType } : {}),
    ...(params.search ? { search: params.search } : {}),
  }), [params])

  const { data: listData, isLoading } = useSupportTickets(filters)
  const { data: kpis } = useSupportKpis()

  const columns = React.useMemo<ColumnDef<SupportTicketListItem>[]>(() => [
    { header: 'ID', cell: (row) => row.id },
    { 
      header: 'Requester', 
      cell: (row) => (
        <div className="flex flex-col">
          <span>{row.requesterName}</span>
          <span className="text-xs text-muted-foreground uppercase tracking-wider">{row.requesterType}</span>
        </div>
      )
    },
    { header: 'Subject', cell: (row) => <div className="max-w-[200px] truncate" title={row.subject}>{row.subject}</div> },
    { header: 'Category', cell: (row) => <span className="capitalize">{row.category.replace('_', ' ')}</span> },
    { header: 'Event', cell: (row) => row.eventName || '-' },
    { 
      header: 'Priority',
      cell: (row) => {
        const colors = { high: 'text-destructive', medium: 'text-orange-500', low: 'text-muted-foreground' }
        return <span className={`capitalize font-medium ${colors[row.priority]}`}>{row.priority}</span>
      }
    },
    { 
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} />
    },
    { 
      header: 'Created',
      cell: (row) => (
        <div title={new Date(row.createdAt).toLocaleString('en-IN')}>
          {new Date(row.createdAt).toLocaleDateString('en-IN')}
        </div>
      )
    },
    { 
      header: 'Actions',
      cell: (row) => (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => {
            setSelectedTicket(row)
            setModalOpen(true)
          }}
        >
          View
        </Button>
      )
    },
  ], [])

  const kpiItems = React.useMemo(() => {
    if (!kpis) return []
    return [
      { id: 'open', label: 'Open Tickets', value: String(kpis.openTickets) },
      { id: 'pending', label: 'Pending', value: String(kpis.pendingTickets) },
      { id: 'resolved', label: 'Resolved', value: String(kpis.resolvedTickets) },
      { id: 'high-priority', label: 'High Priority (Unresolved)', value: String(kpis.highPriority) },
    ]
  }, [kpis])

  return (
    <div className="space-y-6">
      <KpiStrip items={kpiItems} isLoading={!kpis} />
      
      <FilterBar
        searchQuery={params.search || ''}
        onSearchChange={(q) => setParams({ search: q || undefined, page: 1 })}
        placeholder="Search tickets..."
        onReset={clearState}
      >
        <select
          className="h-10 px-3 rounded-md border border-input bg-transparent text-sm"
          value={params.status || ''}
          onChange={(e) => setParams({ status: (e.target.value || undefined) as TicketStatus, page: 1 })}
        >
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="pending">Pending</option>
          <option value="resolved">Resolved</option>
        </select>
        
        <select
          className="h-10 px-3 rounded-md border border-input bg-transparent text-sm"
          value={params.category || ''}
          onChange={(e) => setParams({ category: (e.target.value || undefined) as TicketCategory, page: 1 })}
        >
          <option value="">All Categories</option>
          <option value="tickets">Tickets</option>
          <option value="payments">Payments</option>
          <option value="refunds">Refunds</option>
          <option value="event_info">Event Info</option>
          <option value="orders">Orders</option>
          <option value="accessibility">Accessibility</option>
          <option value="general">General</option>
        </select>

        <select
          className="h-10 px-3 rounded-md border border-input bg-transparent text-sm"
          value={params.priority || ''}
          onChange={(e) => setParams({ priority: (e.target.value || undefined) as TicketPriority, page: 1 })}
        >
          <option value="">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        
        <select
          className="h-10 px-3 rounded-md border border-input bg-transparent text-sm"
          value={params.requesterType || ''}
          onChange={(e) => setParams({ requesterType: (e.target.value || undefined) as RequesterType, page: 1 })}
        >
          <option value="">All Requesters</option>
          <option value="customer">Customer</option>
          <option value="organizer">Organizer</option>
        </select>
      </FilterBar>

      <DataTable
        columns={columns}
        data={listData?.data.tickets || []}
        isLoading={isLoading}
      />

      <SupportDetailModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        ticket={selectedTicket}
      />
    </div>
  )
}
