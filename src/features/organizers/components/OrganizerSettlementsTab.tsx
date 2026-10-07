import { DataTable, type ColumnDef } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shell/StatusBadge'
import { mockSettlementsList } from '@/features/settlements/api'

export function OrganizerSettlementsTab({ organizerId }: { organizerId: string }) {
  // Use mock settlements and filter by organizerId (or just use first 5 for preview)
  const settlements = mockSettlementsList.slice(0, 5)

  const columns: ColumnDef<any>[] = [
    { header: 'Period', cell: (row) => `${new Date(row.periodStart).toLocaleDateString()} - ${new Date(row.periodEnd).toLocaleDateString()}` },
    { header: 'Gross Sales', cell: (row) => `₹${row.grossSales.toLocaleString('en-IN')}` },
    { header: 'Fees', cell: (row) => `₹${(row.platformFee + row.gatewayFee).toLocaleString('en-IN')}` },
    { header: 'Net Payout', cell: (row) => `₹${row.netPayout.toLocaleString('en-IN')}` },
    { header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
  ]

  return (
    <div className="space-y-6">
      <div className="rounded-md border bg-card p-6">
        <h3 className="text-lg font-medium mb-4">Recent Settlements</h3>
        <DataTable
          data={settlements}
          columns={columns}
        />
      </div>
    </div>
  )
}
