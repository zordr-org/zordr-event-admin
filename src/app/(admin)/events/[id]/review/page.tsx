import type { Metadata } from 'next'
import { Can } from '@/components/shell/Can'
import { EventReviewView } from '@/features/events/components/EventReviewView'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  return {
    title: `Event Review #${params.id} | Zordr Admin Portal`,
    robots: { index: false, follow: false },
  }
}

export default async function EventReviewPage(props: PageProps) {
  const params = await props.params;
  return (
    <Can module="events" action="view">
      <EventReviewView id={params.id} />
    </Can>
  )
}
