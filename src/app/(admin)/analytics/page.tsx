import type { Metadata } from 'next'
import { PageHeader } from '@/components/shell/PageHeader'
import { AnalyticsDashboard } from '@/features/analytics'
import { Can } from '@/components/shell/Can'
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
        subtitle="Platform-wide KPIs, growth trends, and revenue breakdowns."
      />
      
      <div className="mt-8">
        <Can 
          module="analytics" 
          action="view" 
          fallback={<EmptyState message="You do not have permission to view analytics." />}
        >
          <AnalyticsDashboard />
        </Can>
      </div>
    </div>
  )
}