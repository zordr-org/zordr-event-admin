import type { Metadata } from 'next'
import { PageHeader } from '@/components/shell/PageHeader'
import { SupportList } from '@/features/support'
import { Can } from '@/components/shell/Can'
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
      <div className="mt-8">
        <Can 
          module="support" 
          action="view" 
          fallback={<EmptyState message="You do not have permission to view support tickets." />}
        >
          <SupportList />
        </Can>
      </div>
    </div>
  )
}