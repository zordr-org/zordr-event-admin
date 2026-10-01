import { OrganizerDetailView } from '@/features/organizers/components/OrganizerDetailView'
import { Can } from '@/components/shell/Can'

interface PageProps {
  params: {
    id: string
  }
}

export default function OrganizerDetailPage({ params }: PageProps) {
  return (
    <Can module="organizers" action="view">
      <OrganizerDetailView id={params.id} />
    </Can>
  )
}
