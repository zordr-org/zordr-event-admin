'use client'

import * as React from 'react'
import { DataTable, type ColumnDef } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shell/StatusBadge'
import { Button } from '@/components/ui/button'
import { MoreHorizontal } from 'lucide-react'

// Static mock data for now, until the Events module API is wired up
const MOCK_EVENTS = [
  {
    id: 'e1',
    name: 'Crescendo Fest 2026',
    date: 'Oct 12, 2026 4:00 PM',
    venue: 'Main Auditorium, KITSW',
    registrations: '856 / 1000',
    revenue: '₹1,71,200',
    status: 'published'
  },
  {
    id: 'e2',
    name: 'Navratri Dandiya 2026',
    date: 'Oct 03, 2026 6:00 PM',
    venue: 'KITSW Grounds',
    registrations: '312 / 500',
    revenue: '₹62,400',
    status: 'published'
  },
  {
    id: 'e3',
    name: 'Freshers Night 2025',
    date: 'Aug 20, 2025 6:00 PM',
    venue: 'Open Air Stage',
    registrations: '80 / 300',
    revenue: '₹14,960',
    status: 'completed'
  }
]

export function OrganizerEventsList({ organizerId }: { organizerId: string }) {
  const columns = React.useMemo<ColumnDef<typeof MOCK_EVENTS[0]>[]>(() => [
    { header: 'Event Name', accessorKey: 'name', className: 'font-medium' },
    { header: 'Date & Time', accessorKey: 'date' },
    { header: 'Venue', accessorKey: 'venue' },
    { header: 'Registrations', accessorKey: 'registrations', className: 'text-right' },
    { header: 'Revenue', accessorKey: 'revenue', className: 'text-right' },
    { 
      header: 'Status', 
      cell: (row) => <StatusBadge status={row.status} /> 
    },
    {
      header: 'Actions',
      cell: () => (
        <div className="flex items-center gap-2">
          <Button variant="link" className="px-2">View</Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ], [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Events</h3>
      </div>
      <DataTable
        columns={columns}
        data={MOCK_EVENTS}
      />
    </div>
  )
}
