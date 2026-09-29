import type { Metadata } from 'next'
import { PageHeader } from '@/components/shell/PageHeader'
import { EmptyState } from '@/components/shell/EmptyState'

export const metadata: Metadata = {
  title: 'Customers | Zordr Admin Portal',
  robots: { index: false, follow: false },
}

export default function CustomersPage() {
  return (
    <div className="p-6 lg:p-8">
      <PageHeader
        title="Customers"
        subtitle="All registered attendees, their spend and activity."
      />
      <div className="mt-12">
        <EmptyState message="Customers screen is coming in the next sprint." />
      </div>
    </div>
  )
}