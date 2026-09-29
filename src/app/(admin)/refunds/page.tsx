import type { Metadata } from 'next'
import { PageHeader } from '@/components/shell/PageHeader'
import { EmptyState } from '@/components/shell/EmptyState'

export const metadata: Metadata = {
  title: 'Refunds | Zordr Admin Portal',
  robots: { index: false, follow: false },
}

export default function RefundsPage() {
  return (
    <div className="p-6 lg:p-8">
      <PageHeader
        title="Refunds"
        subtitle="Refund request queue. Review, approve, or reject."
      />
      <div className="mt-12">
        <EmptyState message="Refunds screen is coming in the next sprint." />
      </div>
    </div>
  )
}