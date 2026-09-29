import type { Metadata } from 'next'
import { PageHeader } from '@/components/shell/PageHeader'
import { EmptyState } from '@/components/shell/EmptyState'

export const metadata: Metadata = {
  title: 'Organizers | Zordr Admin Portal',
  robots: { index: false, follow: false },
}

export default function OrganizersPage() {
  return (
    <div className="p-6 lg:p-8">
      <PageHeader
        title="Organizers"
        subtitle="Manage organizers, track their status, and oversee their events."
      />
      <div className="mt-12">
        <EmptyState message="Organizers screen is coming in the next sprint." />
      </div>
    </div>
  )
}