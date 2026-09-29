import type { Metadata } from 'next'
import { PageHeader } from '@/components/shell/PageHeader'
import { EmptyState } from '@/components/shell/EmptyState'

export const metadata: Metadata = {
  title: 'Orders | Zordr Admin Portal',
  robots: { index: false, follow: false },
}

export default function OrdersPage() {
  return (
    <div className="p-6 lg:p-8">
      <PageHeader
        title="Orders"
        subtitle="Every ticket order across all organizers and events."
      />
      <div className="mt-12">
        <EmptyState message="Orders screen is coming in the next sprint." />
      </div>
    </div>
  )
}