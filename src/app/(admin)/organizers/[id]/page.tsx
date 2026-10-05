import { OrganizerDetailView } from '@/features/organizers/components/OrganizerDetailView'
import { Can } from '@/components/shell/Can'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function OrganizerDetailPage(props: PageProps) {
  const params = await props.params;
  return (
    <Can module="organizers" action="view">
      <OrganizerDetailView id={params.id} />
    </Can>
  )
}
