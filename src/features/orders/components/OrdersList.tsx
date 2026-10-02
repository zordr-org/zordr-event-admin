'use client'

import * as React from 'react'
import {
  Download,
  CreditCard,
  Ban,
  Clock,
  CheckCircle2,
  RefreshCcw,
  Search,
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
import { useOrders, useOrdersKpis, useBulkAction } from '../hooks'
import { formatInr } from '@/lib/format'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { toast } from 'sonner'
import type { OrderListItem, PaymentStatus, OrderStatus } from '../types'
import { getOrdersApi } from '../api'



export function OrdersList() {
  const { state: filters, setUrlState, clearState } = useUrlState({
    page: 1,
    limit: 15,
    q: '',
    eventId: '',
    organizerId: '',
    paymentStatus: undefined as PaymentStatus | undefined,
    orderStatus: undefined as OrderStatus | undefined,
    dateFrom: '',
    dateTo: '',
  })

  const { data: listData, isLoading, isError, refetch } = useOrders(filters)
  const { data: kpis, isLoading: kpisLoading } = useOrdersKpis()
  
  const bulkAction = useBulkAction()
  
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())
  const [refundDialogOpen, setRefundDialogOpen] = React.useState(false)

  // Clear selections when page/data changes
  React.useEffect(() => {
    setSelectedIds(new Set())
  }, [listData?.data.orders])

  const kpiItems: KpiItem[] = React.useMemo(() => [
    { id: 'total', label: 'Total Orders', value: kpis?.totalOrders ?? 0, icon: <CreditCard className="w-5 h-5 text-blue-600" /> },
    { id: 'paid', label: 'Paid', value: kpis?.paidOrders ?? 0, icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" /> },
    { id: 'pending', label: 'Pending', value: kpis?.pendingOrders ?? 0, icon: <Clock className="w-5 h-5 text-amber-600" /> },
    { id: 'failed', label: 'Failed', value: kpis?.failedOrders ?? 0, icon: <Ban className="w-5 h-5 text-red-600" /> },
    { id: 'refunded', label: 'Refunded', value: kpis?.refundedOrders ?? 0, icon: <RefreshCcw className="w-5 h-5 text-purple-600" /> },
    { id: 'success', label: 'Success Rate', value: `${kpis?.successRate ?? 0}%`, icon: <CheckCircle2 className="w-5 h-5 text-green-600" /> },
  ], [kpis])

  const toggleAll = React.useCallback((checked: boolean) => {
    if (checked && listData) {
      setSelectedIds(new Set(listData.data.orders.map(o => o.id)))
    } else {
      setSelectedIds(new Set())
    }
  }, [listData])

  const toggleOne = React.useCallback((id: string, checked: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }, [])

  const handleExportList = async () => {
    try {
      const blob = await getOrdersApi().exportOrders(filters)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `orders-export-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      toast.error('Failed to export orders')
    }
  }

  const handleBulkExport = async () => {
    const orderIds = Array.from(selectedIds)
    bulkAction.mutate(
      { orderIds, action: 'export' },
      {
        onSuccess: (res) => {
          toast.success(`Bulk export queued — job #${res.data.job.id}`)
          // Note: In a real app, this might create an AuditLog entry
          console.log(`Audit: Bulk export job queued for ${orderIds.length} orders`)
          setSelectedIds(new Set())
        }
      }
    )
  }

  const handleBulkRefund = (reason?: string) => {
    const orderIds = Array.from(selectedIds)
    bulkAction.mutate(
      { orderIds, action: 'refund' },
      {
        onSuccess: (res) => {
          toast.success(`Bulk refund queued — job #${res.data.job.id}`)
          // Note: In a real app, this would write an AuditLog entry with the reason
          console.log(`Audit: Bulk refund job queued for ${orderIds.length} orders. Reason: ${reason}`)
          setRefundDialogOpen(false)
          setSelectedIds(new Set())
        }
      }
    )
  }

  const allSelected = Boolean(listData && listData.data.orders.length > 0 && selectedIds.size === listData.data.orders.length)
  const isIndeterminate = selectedIds.size > 0 && selectedIds.size < (listData?.data.orders.length ?? 0)

  const columns = React.useMemo<ColumnDef<OrderListItem>[]>(() => [
    {
      header: (
        <input
          type="checkbox"
          className="w-4 h-4 rounded border-gray-300"
          checked={allSelected}
          onChange={(e) => toggleAll(e.target.checked)}
          ref={(input) => { if (input) input.indeterminate = isIndeterminate }}
          aria-label="Select all"
        />
      ),
      cell: (row) => (
        <input
          type="checkbox"
          className="w-4 h-4 rounded border-gray-300"
          checked={selectedIds.has(row.id)}
          onChange={(e) => toggleOne(row.id, e.target.checked)}
          aria-label={`Select ${row.id}`}
        />
      ),
      className: 'w-[40px] pr-0',
    },
    {
      header: 'Order ID',
      accessorKey: 'id',
      className: 'font-medium',
    },
    {
      header: 'Customer',
      cell: (row) => (
        <div>
          <p className="font-medium text-sm">{row.customerName}</p>
          <p className="text-xs text-muted-foreground">{row.customerEmail}</p>
        </div>
      ),
    },
    {
      header: 'Event / Organizer',
      cell: (row) => (
        <div className="max-w-[200px]">
          <p className="font-medium text-sm truncate" title={row.eventName}>{row.eventName}</p>
          <p className="text-xs text-muted-foreground truncate">{row.organizerName}</p>
        </div>
      ),
    },
    {
      header: 'Amount',
      cell: (row) => <span className="font-medium">{formatInr(row.amount, true)}</span>,
      className: 'text-right'
    },
    {
      header: 'Tickets',
      accessorKey: 'ticketsCount',
      className: 'text-right'
    },
    {
      header: 'Gateway',
      cell: (row) => <span className="text-sm text-muted-foreground">{row.paymentGateway}</span>,
    },
    {
      header: 'Status',
      cell: (row) => (
        <div className="flex flex-col gap-1 items-start">
          <StatusBadge status={row.paymentStatus} />
          <span className="text-[10px] text-muted-foreground uppercase">{row.orderStatus}</span>
        </div>
      )
    },
    {
      header: 'Created At',
      cell: (row) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {new Date(row.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </span>
      ),
    }
  ], [selectedIds, listData, allSelected, isIndeterminate, toggleAll, toggleOne])

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Orders"
        description="View and manage ticket orders and bulk actions."
        actions={
          <Can module="orders" action="export">
            <Button variant="outline" onClick={handleExportList}>
              <Download className="w-4 h-4 mr-2" /> Export
            </Button>
          </Can>
        }
      />

      <KpiStrip items={kpiItems} isLoading={kpisLoading} />

      <FilterBar
        searchQuery={filters.q}
        onSearchChange={(q) => setUrlState({ q, page: 1 })}
        placeholder="Search customer name, email, or order ID..."
        onReset={clearState}
      >
        <select
          className="h-10 px-3 rounded-md border border-input bg-transparent text-sm"
          value={filters.paymentStatus ?? ''}
          onChange={(e) => setUrlState({ paymentStatus: (e.target.value || undefined) as PaymentStatus, page: 1 })}
        >
          <option value="">All Payment Statuses</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>

        <select
          className="h-10 px-3 rounded-md border border-input bg-transparent text-sm"
          value={filters.orderStatus ?? ''}
          onChange={(e) => setUrlState({ orderStatus: (e.target.value || undefined) as OrderStatus, page: 1 })}
        >
          <option value="">All Order Statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
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

      {selectedIds.size > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-md p-3 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="text-sm font-medium text-primary">
            {selectedIds.size} order{selectedIds.size > 1 ? 's' : ''} selected
          </div>
          <div className="flex gap-2">
            <Can module="orders" action="export">
              <Button size="sm" variant="outline" onClick={handleBulkExport} disabled={bulkAction.isPending} aria-label="Export Selected Orders">
                <Download className="w-4 h-4 mr-2" /> Export Selected
              </Button>
            </Can>
            <Can module="orders" action="edit">
              <Button size="sm" variant="destructive" onClick={() => setRefundDialogOpen(true)} disabled={bulkAction.isPending}>
                <RefreshCcw className="w-4 h-4 mr-2" /> Bulk Refund
              </Button>
            </Can>
          </div>
        </div>
      )}

      <DataTable
        columns={columns}
        data={listData?.data.orders ?? []}
        isLoading={isLoading}
        isError={isError}
        emptyState={
          <EmptyState
            title="No orders found"
            description="No orders match your current filters."
            action={{ label: 'Clear filters', onClick: clearState }}
          />
        }
        errorState={
          <div className="text-center p-8">
            <p className="text-destructive font-medium">Failed to load orders.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>Retry</Button>
          </div>
        }
      />

      {listData?.data.pagination && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>
            Showing {(listData.data.pagination.page - 1) * listData.data.pagination.limit + 1}–
            {Math.min(listData.data.pagination.page * listData.data.pagination.limit, listData.data.pagination.total)} of{' '}
            {listData.data.pagination.total} orders
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
        open={refundDialogOpen}
        onOpenChange={setRefundDialogOpen}
        title="Bulk Refund Orders"
        description={`You are about to issue refunds for ${selectedIds.size} selected order(s). This action cannot be undone.`}
        warningText="Only orders with 'paid' status will actually be refunded. Other orders will be ignored."
        confirmText="Queue Refund Job"
        requireReason={true}
        isDestructive={true}
        isLoading={bulkAction.isPending}
        onConfirm={handleBulkRefund}
      />
    </div>
  )
}
