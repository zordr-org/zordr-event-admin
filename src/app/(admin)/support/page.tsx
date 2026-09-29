import type { Metadata } from 'next'
import { PageHeader } from '@/components/shell/PageHeader'
import { EmptyState } from '@/components/shell/EmptyState'

export const metadata: Metadata = {
  title: 'Support | Zordr Admin Portal',
  robots: { index: false, follow: false },
}

export default function SupportPage() {
  return (
    <div className="p-6 lg:p-8">
      <PageHeader
        title="Support"
        subtitle="Cross-platform ticketing for organizer and customer issues."
      />
      <div className="mt-12">
        <EmptyState message="Support screen is coming in the next sprint." />
      </div>
    </div>
  )
}