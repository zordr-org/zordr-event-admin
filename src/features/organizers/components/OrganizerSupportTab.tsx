import { DataTable, type ColumnDef } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shell/StatusBadge'
import { mockSupportTickets } from '@/features/support/mock'

export function OrganizerSupportTab({ organizerId }: { organizerId: string }) {
  // Use mock support tickets and filter by organizer
  const tickets = mockSupportTickets.filter(t => t.requesterType === 'organizer').slice(0, 5)

  const columns: ColumnDef<any>[] = [
    { header: 'ID', cell: (row) => row.id },
    { header: 'Subject', cell: (row) => <div className="max-w-[200px] truncate" title={row.subject}>{row.subject}</div> },
    { header: 'Category', cell: (row) => <span className="capitalize">{row.category.replace('_', ' ')}</span> },
    { 
      header: 'Priority',
      cell: (row) => {
        const colors: Record<string, string> = { high: 'text-destructive', medium: 'text-orange-500', low: 'text-muted-foreground' }
        return <span className={`capitalize font-medium ${colors[row.priority]}`}>{row.priority}</span>
      }
    },
    { header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
    { header: 'Created', cell: (row) => new Date(row.createdAt).toLocaleDateString('en-IN') },
  ]

  return (
    <div className="space-y-6">
      <div className="rounded-md border bg-card p-6">
        <h3 className="text-lg font-medium mb-4">Support Tickets</h3>
        <DataTable
          data={tickets}
          columns={columns}
        />
      </div>
    </div>
  )
}
