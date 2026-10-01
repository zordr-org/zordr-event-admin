import type { Metadata } from 'next'
import { Can } from '@/components/shell/Can'
import { EventReviewView } from '@/features/events/components/EventReviewView'

interface PageProps {
  params: { id: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: `Event Review #${params.id} | Zordr Admin Portal`,
    robots: { index: false, follow: false },
  }
}

export default function EventReviewPage({ params }: PageProps) {
  return (
    <Can module="events" action="view">
      <EventReviewView id={params.id} />
    </Can>
  )
}
