import { OrganizerDetailView } from '@/features/organizers/components/OrganizerDetailView'

interface PageProps {
  params: {
    id: string
  }
}

export default function OrganizerDetailPage({ params }: PageProps) {
  return <OrganizerDetailView id={params.id} />
}
