import type { Metadata } from 'next'
import { PageHeader } from '@/components/shell/PageHeader'
import { EmptyState } from '@/components/shell/EmptyState'

export const metadata: Metadata = {
  title: 'Analytics | Zordr Admin Portal',
  robots: { index: false, follow: false },
}

export default function AnalyticsPage() {
  return (
    <div className="p-6 lg:p-8">
      <PageHeader
        title="Analytics"
        subtitle="GMV, order, and customer trends. Top performers and breakdowns."
      />
      <div className="mt-12">
        <EmptyState message="Analytics screen is coming in the next sprint." />
      </div>
    </div>
  )
}