import type { Metadata } from 'next'
import { Can } from '@/components/shell/Can'
import { EventsList } from '@/features/events/components/EventsList'

export const metadata: Metadata = {
  title: 'Events | Zordr Admin Portal',
  description: 'Review, moderate, and track all events on the Zordr platform.',
  robots: { index: false, follow: false },
}

export default function EventsPage() {
  return (
    <Can module="events" action="view">
      <EventsList />
    </Can>
  )
}