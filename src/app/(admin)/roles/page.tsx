import type { Metadata } from 'next'
import { PageHeader } from '@/components/shell/PageHeader'
import { EmptyState } from '@/components/shell/EmptyState'

export const metadata: Metadata = {
  title: 'Roles | Zordr Admin Portal',
  robots: { index: false, follow: false },
}

export default function RolesPage() {
  return (
    <div className="p-6 lg:p-8">
      <PageHeader
        title="Roles"
        subtitle="Manage custom roles and access permissions for employees."
      />
      <div className="mt-12">
        <EmptyState message="Roles screen is coming in the next sprint." />
      </div>
    </div>
  )
}
