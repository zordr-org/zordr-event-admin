import type { Metadata } from 'next'
import { PageHeader } from '@/components/shell/PageHeader'
import { EmptyState } from '@/components/shell/EmptyState'

export const metadata: Metadata = {
  title: 'Events | Zordr Admin Portal',
  robots: { index: false, follow: false },
}

export default function EventsPage() {
  return (
    <div className="p-6 lg:p-8">
      <PageHeader
        title="Events"
        subtitle="Manage all events on Zordr. Review, approve and track their performance."
      />
      <div className="mt-12">
        <EmptyState message="Events screen is coming in the next sprint." />
      </div>
    </div>
  )
}