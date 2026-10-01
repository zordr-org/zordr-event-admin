'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  CalendarDays, CheckCircle2, Clock, XCircle, Ban, Tag, MapPin, ArrowRight, Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shell/PageHeader'
import { StatusBadge } from '@/components/shell/StatusBadge'
import { EmptyState } from '@/components/shell/EmptyState'
import { FilterBar } from '@/components/shared/FilterBar'
import { DataTable, type ColumnDef } from '@/components/shared/DataTable'
import { KpiStrip, type KpiItem } from '@/components/shared/KpiStrip'
import { Can } from '@/components/shell/Can'
import { useUrlState } from '@/hooks/useUrlState'
import { useEvents, useEventKpis } from '../hooks'
import { getRowAction } from '../lib/status'
import { formatInr } from '@/lib/format'
import type { EventListItem, EventStatus } from '../types'

const CATEGORIES = ['Music', 'Tech', 'Cultural', 'Sports', 'Workshop', 'Comedy', 'Art', 'Food']
const CITIES = ['Hyderabad', 'Bangalore', 'Mumbai', 'Delhi', 'Chennai', 'Pune']

function statusLabel(status: EventStatus): string {
  const map: Record<EventStatus, string> = {
    draft: 'Draft',
    submitted: 'Submitted',
    pending_review: 'Pending Review',
    published: 'Published',
    sent_back: 'Sent Back',
    rejected: 'Rejected',
    cancelled: 'Cancelled',
    completed: 'Completed',
  }
  return map[status] ?? status
}

export function EventsList() {
  const router = useRouter()
  const { state: filters, setUrlState, clearState } = useUrlState({
    page: 1,
    limit: 15,
    q: '',
    status: undefined as EventStatus | undefined,
    category: '',
    city: '',
  })

  const { data: listData, isLoading, isError, refetch } = useEvents(filters)
  const { data: kpis, isLoading: kpisLoading } = useEventKpis()

  const kpiItems: KpiItem[] = React.useMemo(() => [
    { id: 'total', label: 'Total Events', value: kpis?.total ?? 0, icon: <CalendarDays className="w-5 h-5 text-blue-600" /> },
    { id: 'published', label: 'Published', value: kpis?.published ?? 0, icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" /> },
    { id: 'pending', label: 'Pending Review', value: kpis?.pendingReview ?? 0, icon: <Clock className="w-5 h-5 text-amber-600" />, inverseTrendColor: true },
    { id: 'completed', label: 'Completed', value: kpis?.completed ?? 0, icon: <CheckCircle2 className="w-5 h-5 text-purple-600" /> },
    { id: 'cancelled', label: 'Cancelled', value: kpis?.cancelled ?? 0, icon: <Ban className="w-5 h-5 text-red-600" /> },
  ], [kpis])

  const columns = React.useMemo<ColumnDef<EventListItem>[]>(() => [
    {
      header: 'Event',
      cell: (row) => (
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand/20 to-purple-500/20 shrink-0 flex items-center justify-center">
            <CalendarDays className="w-4 h-4 text-brand" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm truncate max-w-[220px]">{row.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{row.organizerName}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Category',
      cell: (row) => (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
          <Tag className="w-3 h-3" /> {row.category}
        </span>
      ),
    },
    {
      header: 'City',
      cell: (row) => (
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="w-3 h-3" /> {row.city}
        </span>
      ),
    },
    {
      header: 'Date',
      cell: (row) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {new Date(row.dateFrom).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      ),
    },
    {
      header: 'Tickets',
      accessorKey: 'ticketCount',
      className: 'text-right',
    },
    {
      header: 'Revenue',
      cell: (row) => (
        <span className="text-sm font-medium tabular-nums">{formatInr(row.totalRevenue, true)}</span>
      ),
      className: 'text-right',
    },
    {
      header: 'Status',
      cell: (row) => <StatusBadge status={statusLabel(row.status)} />,
    },
    {
      header: 'Action',
      cell: (row) => {
        const action = getRowAction(row.status)
        return (
          <Can module="events" action="view">
            {action === 'review' ? (
              <Can module="events" action="edit">
                <Button
                  size="sm"
                  className="h-8 text-xs gap-1 bg-amber-600 hover:bg-amber-700 text-white"
                  onClick={(e) => { e.stopPropagation(); router.push(`/events/${row.id}/review`) }}
                >
                  Review <ArrowRight className="w-3 h-3" />
                </Button>
              </Can>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs gap-1"
                onClick={(e) => { e.stopPropagation(); router.push(`/events/${row.id}/review`) }}
              >
                <Eye className="w-3 h-3" /> View
              </Button>
            )}
          </Can>
        )
      },
    },
  ], [router])

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Events"
        subtitle="Review, moderate, and track all events on Zordr."
      />

      <KpiStrip items={kpiItems} isLoading={kpisLoading} />

      <FilterBar
        searchQuery={filters.q}
        onSearchChange={(q) => setUrlState({ q, page: 1 })}
        placeholder="Search by title, organizer, or city..."
        onReset={clearState}
      >
        <select
          className="h-10 px-3 rounded-md border border-input bg-transparent text-sm"
          value={filters.status ?? ''}
          onChange={(e) => setUrlState({ status: (e.target.value || undefined) as EventStatus | undefined, page: 1 })}
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
          <option value="pending_review">Pending Review</option>
          <option value="published">Published</option>
          <option value="sent_back">Sent Back</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
          <option value="completed">Completed</option>
        </select>

        <select
          className="h-10 px-3 rounded-md border border-input bg-transparent text-sm"
          value={filters.category ?? ''}
          onChange={(e) => setUrlState({ category: e.target.value || undefined, page: 1 })}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <select
          className="h-10 px-3 rounded-md border border-input bg-transparent text-sm"
          value={filters.city ?? ''}
          onChange={(e) => setUrlState({ city: e.target.value || undefined, page: 1 })}
        >
          <option value="">All Cities</option>
          {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </FilterBar>

      <DataTable
        columns={columns}
        data={listData?.data.events ?? []}
        isLoading={isLoading}
        isError={isError}
        emptyState={
          <EmptyState
            title="No events found"
            description="No events match your current filters."
            action={{ label: 'Clear filters', onClick: clearState }}
          />
        }
        errorState={
          <div className="text-center p-8">
            <p className="text-destructive font-medium">Failed to load events.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>Retry</Button>
          </div>
        }
      />

      {listData?.data.pagination && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>
            Showing {(listData.data.pagination.page - 1) * listData.data.pagination.limit + 1}–
            {Math.min(listData.data.pagination.page * listData.data.pagination.limit, listData.data.pagination.total)} of{' '}
            {listData.data.pagination.total} events
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
