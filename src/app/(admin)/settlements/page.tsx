import { Metadata } from 'next'
import { SettlementsList } from '@/features/settlements/components/SettlementsList'
import { Can } from '@/components/shell/Can'

export const metadata: Metadata = {
  title: 'Settlements | Zordr Admin',
  description: 'Manage organizer payouts, platform fees, and view transfer status.',
}

export default function SettlementsPage() {
  return (
    <Can module="settlements" action="view">
      <SettlementsList />
    </Can>
  )
}