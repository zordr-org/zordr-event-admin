import type { Metadata } from 'next'
import { PageHeader } from '@/components/shell/PageHeader'
import { EmptyState } from '@/components/shell/EmptyState'

export const metadata: Metadata = {
  title: 'Settings | Zordr Admin Portal',
  robots: { index: false, follow: false },
}

export default function SettingsPage() {
  return (
    <div className="p-6 lg:p-8">
      <PageHeader
        title="Settings"
        subtitle="Manage your platform settings, preferences, and configurations."
      />
      <div className="mt-12">
        <EmptyState message="Settings screen is coming in the next sprint." />
      </div>
    </div>
  )
}