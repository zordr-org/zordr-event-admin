import { KpiStrip } from '@/components/shared/KpiStrip'
import { DataTable, type ColumnDef } from '@/components/shared/DataTable'

// Mock revenue data for the tab
const mockEventRevenue = [
  { eventId: 'evt-1', name: 'Summer Music Fest', ticketsSold: 450, grossRevenue: 450000 },
  { eventId: 'evt-2', name: 'Winter Bash', ticketsSold: 300, grossRevenue: 300000 },
  { eventId: 'evt-3', name: 'Tech Conference 2026', ticketsSold: 120, grossRevenue: 600000 },
]

export function OrganizerRevenueTab({ organizerId }: { organizerId: string }) {
  const kpiItems = [
    { id: 'gmv', label: 'Lifetime GMV', value: '₹13,50,000' },
    { id: 'commission', label: 'Commission Paid', value: '₹67,500' },
    { id: 'net', label: 'Net Payout Received', value: '₹12,82,500' },
    { id: 'aov', label: 'Avg. Order Value', value: '₹1,550' },
  ]

  const columns: ColumnDef<any>[] = [
    { header: 'Event', cell: (row) => <span className="font-medium">{row.name}</span> },
    { header: 'Tickets Sold', cell: (row) => row.ticketsSold },
    { header: 'Gross Revenue', cell: (row) => `₹${row.grossRevenue.toLocaleString('en-IN')}` },
  ]

  return (
    <div className="space-y-6">
      <KpiStrip items={kpiItems} />
      
      <div className="rounded-md border bg-card p-6">
        <h3 className="text-lg font-medium mb-4">Revenue Breakdown by Event</h3>
        <DataTable
          data={mockEventRevenue}
          columns={columns}
        />
      </div>
    </div>
  )
}
