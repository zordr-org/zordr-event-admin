import { Metadata } from 'next'
import { RolesList } from '@/features/roles'

export const metadata: Metadata = {
  title: 'Roles & Permissions | Zordr Admin',
}

export default function RolesPage() {
  return <RolesList />
}
