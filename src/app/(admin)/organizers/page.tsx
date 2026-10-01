import { OrganizersList } from '@/features/organizers/components/OrganizersList'
import { Can } from '@/components/shell/Can'

export default function OrganizersPage() {
  return (
    <Can module="organizers" action="view">
      <OrganizersList />
    </Can>
  )
}