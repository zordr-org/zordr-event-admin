import type { Metadata } from 'next'
import { PageHeader } from '@/components/shell/PageHeader'
import { EmptyState } from '@/components/shell/EmptyState'

export const metadata: Metadata = {
  title: 'Employees | Zordr Admin Portal',
  robots: { index: false, follow: false },
}

export default function EmployeesPage() {
  return (
    <div className="p-6 lg:p-8">
      <PageHeader
        title="Employees"
        subtitle="Manage your team members, assign roles, and control access permissions."
      />
      <div className="mt-12">
        <EmptyState message="Employees screen is coming in the next sprint." />
      </div>
    </div>
  )
}