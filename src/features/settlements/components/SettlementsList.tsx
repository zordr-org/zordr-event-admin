'use client'

import * as React from 'react'
import {
  Download,
  CreditCard,
  Ban,
  Clock,
  CheckCircle2,
  Play,
  Hand
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
import { 
  useSettlements, 
  useSettlementsKpis, 
  useGenerateSettlement, 
  useHoldSettlement, 
  useMarkPaidSettlement 
} from '../hooks'
import { formatInr } from '@/lib/format'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { toast } from 'sonner'
import type { SettlementListItem, SettlementStatus } from '../types'
import { getSettlementsApi } from '../api'

// Simple modal for Generate Settlement
function GenerateSettlementModal({ open, onOpenChange, onSubmit, isPending }: { open: boolean, onOpenChange: (open: boolean) => void, onSubmit: (data: any) => void, isPending: boolean }) {
  const [periodStart, setPeriodStart] = React.useState('')
  const [periodEnd, setPeriodEnd] = React.useState('')
  const [organizerId, setOrganizerId] = React.useState('')

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
        <h3 className="text-lg font-semibold mb-2">Generate Settlement</h3>
        <p className="text-sm text-muted-foreground mb-4">Select a date range to compute settlements.</p>
        
        <form onSubmit={(e) => {
          e.preventDefault()
          onSubmit({ periodStart, periodEnd, organizerId: organizerId || undefined })
        }} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Period Start</label>
            <input required type="date" className="w-full h-10 px-3 rounded-md border border-input bg-transparent text-sm" value={periodStart} onChange={e => setPeriodStart(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Period End</label>
            <input required type="date" className="w-full h-10 px-3 rounded-md border border-input bg-transparent text-sm" value={periodEnd} onChange={e => setPeriodEnd(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Organizer ID (Optional)</label>
            <input type="text" placeholder="e.g. org-1" className="w-full h-10 px-3 rounded-md border border-input bg-transparent text-sm" value={organizerId} onChange={e => setOrganizerId(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>Cancel</Button>
            <Button type="submit" disabled={isPending}>Generate</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function MarkPaidModal({ open, onOpenChange, onSubmit, isPending }: { open: boolean, onOpenChange: (open: boolean) => void, onSubmit: (data: { transferReference: string, transferDate: string }) => void, isPending: boolean }) {
  const [transferReference, setTransferReference] = React.useState('')
  const [transferDate, setTransferDate] = React.useState('')

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
        <h3 className="text-lg font-semibold mb-2">Mark Settlement as Paid</h3>
        
        <form onSubmit={(e) => {
          e.preventDefault()
          onSubmit({ transferReference, transferDate })
        }} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="transfer-ref" className="text-sm font-medium">Transfer Reference</label>
            <input id="transfer-ref" required type="text" className="w-full h-10 px-3 rounded-md border border-input bg-transparent text-sm" value={transferReference} onChange={e => setTransferReference(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label htmlFor="transfer-date" className="text-sm font-medium">Transfer Date</label>
            <input id="transfer-date" required type="date" className="w-full h-10 px-3 rounded-md border border-input bg-transparent text-sm" value={transferDate} onChange={e => setTransferDate(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>Cancel</Button>
            <Button type="submit" disabled={isPending}>Mark Paid</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function SettlementsList() {
  const { state: filters, setUrlState, clearState } = useUrlState({
    page: 1,
    limit: 15,
    organizerId: '',
    eventId: '',
    status: undefined as SettlementStatus | undefined,
    dateFrom: '',
    dateTo: '',
  })

  const { data: listData, isLoading, isError, refetch } = useSettlements(filters)
  const { data: kpis, isLoading: kpisLoading } = useSettlementsKpis()
  
  const generateAction = useGenerateSettlement()
  const holdAction = useHoldSettlement()
  const markPaidAction = useMarkPaidSettlement()
  
  const [generateOpen, setGenerateOpen] = React.useState(false)
  const [holdId, setHoldId] = React.useState<string | null>(null)
  const [markPaidId, setMarkPaidId] = React.useState<string | null>(null)

  const kpiItems: KpiItem[] = React.useMemo(() => [
    { id: 'total', label: 'Total Payout', value: formatInr(kpis?.totalPayout ?? 0), icon: <CreditCard className="w-5 h-5 text-blue-600" /> },
    { id: 'paid', label: 'Paid', value: formatInr(kpis?.paidPayout ?? 0), icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" /> },
    { id: 'pending', label: 'Pending', value: formatInr(kpis?.pendingPayout ?? 0), icon: <Clock className="w-5 h-5 text-amber-600" /> },
    { id: 'on_hold', label: 'On Hold', value: formatInr(kpis?.onHoldPayout ?? 0), icon: <Hand className="w-5 h-5 text-red-600" /> },
  ], [kpis])

  const handleExportList = async () => {
    try {
      const blob = await getSettlementsApi().exportSettlements(filters, 'csv')
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `settlements-export-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      toast.error('Failed to export settlements')
    }
  }

  const columns = React.useMemo<ColumnDef<SettlementListItem>[]>(() => [
    {
      header: 'Organizer',
      cell: (row) => (
        <div className="max-w-[150px]">
          <p className="font-medium text-sm truncate">{row.organizerName}</p>
          <p className="text-xs text-muted-foreground truncate">{row.organizerId}</p>
        </div>
      ),
    },
    {
      header: 'Period',
      cell: (row) => (
        <span className="text-xs whitespace-nowrap">
          {new Date(row.periodStart).toLocaleDateString('en-IN')} - {new Date(row.periodEnd).toLocaleDateString('en-IN')}
        </span>
      ),
    },
    {
      header: 'Gross',
      cell: (row) => <span className="text-sm">{formatInr(row.grossSales, true)}</span>,
      className: 'text-right'
    },
    {
      header: 'Fees (Plat+Gate)',
      cell: (row) => <span className="text-sm text-red-600">-{formatInr(row.platformFee + row.gatewayFee, true)}</span>,
      className: 'text-right'
    },
    {
      header: 'Refunds',
      cell: (row) => <span className="text-sm text-red-600">{row.refunds > 0 ? `-${formatInr(row.refunds, true)}` : '-'}</span>,
      className: 'text-right'
    },
    {
      header: 'Net Payout',
      cell: (row) => <span className="font-medium">{formatInr(row.netPayout, true)}</span>,
      className: 'text-right'
    },
    {
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex gap-2 justify-end">
          {row.status !== 'paid' && (
            <Can module="settlements" action="edit">
              <Button size="sm" variant="outline" onClick={() => setHoldId(row.id)}>Hold</Button>
              <Button size="sm" onClick={() => setMarkPaidId(row.id)}>Mark Paid</Button>
            </Can>
          )}
        </div>
      ),
      className: 'text-right'
    }
  ], [])

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Settlements"
        description="Manage organizer payouts and platform fees."
        actions={
          <div className="flex gap-2">
            <Can module="settlements" action="export">
              <Button variant="outline" onClick={handleExportList}>
                <Download className="w-4 h-4 mr-2" /> Export
              </Button>
            </Can>
            <Can module="settlements" action="edit">
              <Button onClick={() => setGenerateOpen(true)}>
                <Play className="w-4 h-4 mr-2" /> Generate
              </Button>
            </Can>
          </div>
        }
      />

      <KpiStrip items={kpiItems} isLoading={kpisLoading} />

      <FilterBar
        searchQuery={filters.organizerId ?? ''}
        onSearchChange={(q) => setUrlState({ organizerId: q || undefined, page: 1 })}
        placeholder="Filter by Organizer ID..."
        onReset={clearState}
      >
        <select
          className="h-10 px-3 rounded-md border border-input bg-transparent text-sm"
          value={filters.status ?? ''}
          onChange={(e) => setUrlState({ status: (e.target.value || undefined) as SettlementStatus, page: 1 })}
        >
          <option value="">All Statuses</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="on_hold">On Hold</option>
          <option value="failed">Failed</option>
        </select>
        <input 
          type="text" 
          placeholder="Event ID..." 
          className="h-10 px-3 rounded-md border border-input bg-transparent text-sm w-32" 
          value={filters.eventId ?? ''} 
          onChange={(e) => setUrlState({ eventId: e.target.value || undefined, page: 1 })} 
        />
      </FilterBar>

      <DataTable
        columns={columns}
        data={listData?.data.settlements ?? []}
        isLoading={isLoading}
        isError={isError}
        emptyState={
          <EmptyState
            title="No settlements found"
            description="No settlements match your current filters."
            action={{ label: 'Clear filters', onClick: clearState }}
          />
        }
        errorState={
          <div className="text-center p-8">
            <p className="text-destructive font-medium">Failed to load settlements.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>Retry</Button>
          </div>
        }
      />

      {listData?.data.pagination && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>
            Showing {(listData.data.pagination.page - 1) * listData.data.pagination.limit + 1}–
            {Math.min(listData.data.pagination.page * listData.data.pagination.limit, listData.data.pagination.total)} of{' '}
            {listData.data.pagination.total} settlements
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

      <p className="text-xs text-muted-foreground text-center mt-8">
        Payouts initiated within 5–7 business days from end of settlement period, subject to no pending refunds/disputes.
      </p>

      <GenerateSettlementModal
        open={generateOpen}
        onOpenChange={setGenerateOpen}
        isPending={generateAction.isPending}
        onSubmit={(data) => {
          generateAction.mutate(data, {
            onSuccess: (res) => {
              toast.success(`Settlement generation queued — job #${res.data.job.id}`)
              setGenerateOpen(false)
            }
          })
        }}
      />

      <ConfirmDialog
        open={!!holdId}
        onOpenChange={(open) => !open && setHoldId(null)}
        title="Hold Settlement"
        description="Place this settlement on hold. Provide a reason for the organizer."
        confirmText="Put on Hold"
        requireReason={true}
        isDestructive={true}
        isLoading={holdAction.isPending}
        onConfirm={(reason) => {
          if (holdId && reason) {
            holdAction.mutate({ id: holdId, reason }, {
              onSuccess: () => {
                toast.success('Settlement placed on hold')
                setHoldId(null)
              }
            })
          }
        }}
      />

      <MarkPaidModal
        open={!!markPaidId}
        onOpenChange={(open) => !open && setMarkPaidId(null)}
        isPending={markPaidAction.isPending}
        onSubmit={(data) => {
          if (markPaidId) {
            markPaidAction.mutate({ id: markPaidId, data }, {
              onSuccess: () => {
                toast.success('Settlement marked as paid')
                setMarkPaidId(null)
              }
            })
          }
        }}
      />
    </div>
  )
}
