import type { Metadata } from 'next'
import { PageHeader } from '@/components/shell/PageHeader'
import { EmptyState } from '@/components/shell/EmptyState'

export const metadata: Metadata = {
  title: 'Settlements | Zordr Admin Portal',
  robots: { index: false, follow: false },
}

export default function SettlementsPage() {
  return (
    <div className="p-6 lg:p-8">
      <PageHeader
        title="Settlements"
        subtitle="Platform-wide payout ledger, fee breakdown, and status."
      />
      <div className="mt-12">
        <EmptyState message="Settlements screen is coming in the next sprint." />
      </div>
    </div>
  )
}