'use client'

import * as React from 'react'
import { DataTable, type ColumnDef } from '@/components/shared/DataTable'
import { KpiStrip } from '@/components/shared/KpiStrip'
import { StatusBadge } from '@/components/shell/StatusBadge'
import { Button } from '@/components/ui/button'
import { FilterBar } from '@/components/shared/FilterBar'
import { useUrlState } from '@/hooks/useUrlState'
import { formatInr } from '@/lib/format'
import { Eye, FileCheck } from 'lucide-react'
import { useRefunds, useRefundsKpis } from '../hooks'
import type { RefundListItem, RefundStatus } from '../types'
import { RefundReviewModal } from './RefundReviewModal'
import { Can } from '@/components/shell/Can'

export function RefundsList() {
  const { state: params, setUrlState: setParams, clearState } = useUrlState({
    page: 1,
    limit: 15,
    status: '' as RefundStatus | '',
    eventId: '',
  })

  const [selectedRefund, setSelectedRefund] = React.useState<RefundListItem | null>(null)
  const [reviewModalOpen, setReviewModalOpen] = React.useState(false)
  const [readOnly, setReadOnly] = React.useState(false)

  const filters = React.useMemo(() => ({
    page: params.page,
    limit: params.limit,
    ...(params.status ? { status: params.status as RefundStatus } : {}),
    ...(params.eventId ? { eventId: params.eventId } : {}),
  }), [params])

  const { data: listData, isLoading } = useRefunds(filters)
  const { data: kpis } = useRefundsKpis()

  const columns = React.useMemo<ColumnDef<RefundListItem>[]>(() => [
    { header: 'Refund ID', cell: (row) => row.id },
    { header: 'Order ID', cell: (row) => row.orderId },
    { header: 'Customer', cell: (row) => row.customerName },
    { header: 'Event', cell: (row) => row.eventName },
    { 
      header: 'Amount',
      cell: (row) => formatInr(row.amount, true)
    },
    { 
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} />
    },
    { 
      header: 'Requested On',
      cell: (row) => new Date(row.requestedOn).toLocaleDateString('en-IN')
    },
    {
      header: 'Actions',
      cell: (row) => {
        const isPending = row.status === 'pending'
        
        if (isPending) {
          return (
            <Can module="refunds" action="edit">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setSelectedRefund(row)
                  setReadOnly(false)
                  setReviewModalOpen(true)
                }}
              >
                <FileCheck className="w-4 h-4 mr-2" />
                Review
              </Button>
            </Can>
          )
        }
        
        return (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              setSelectedRefund(row)
              setReadOnly(true)
              setReviewModalOpen(true)
            }}
          >
            <Eye className="w-4 h-4 mr-2" />
            View
          </Button>
        )
      }
    }
  ], [])

  const kpiItems = React.useMemo(() => {
    if (!kpis) return []
    return [
      { id: 'total', label: 'Total Refunds', value: String(kpis.totalRefunds) },
      { id: 'processed', label: 'Processed', value: String(kpis.processedRefunds) },
      { id: 'pending', label: 'Pending', value: String(kpis.pendingRefunds) },
      { id: 'rejected', label: 'Rejected', value: String(kpis.rejectedRefunds) },
    ]
  }, [kpis])

  return (
    <div className="space-y-6">
      <KpiStrip items={kpiItems} isLoading={!kpis} />
      
      <FilterBar
        searchQuery={params.eventId || ''}
        onSearchChange={(q) => setParams({ eventId: q || undefined, page: 1 })}
        placeholder="Filter by Event ID..."
        onReset={clearState}
      >
        <select
          className="h-10 px-3 rounded-md border border-input bg-transparent text-sm"
          value={params.status || ''}
          onChange={(e) => setParams({ status: (e.target.value || undefined) as RefundStatus, page: 1 })}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="processed">Processed</option>
          <option value="rejected">Rejected</option>
        </select>
      </FilterBar>

      <DataTable
        columns={columns}
        data={listData?.data.refunds || []}
        isLoading={isLoading}
      />

      <div className="text-sm text-muted-foreground pt-4 border-t">
        <p>Refund Policy: Approved refunds take 5–7 business days for processing and reflecting in the customer&apos;s account.</p>
      </div>

      <RefundReviewModal
        open={reviewModalOpen}
        onOpenChange={setReviewModalOpen}
        refund={selectedRefund}
        readOnly={readOnly}
      />
    </div>
  )
}
