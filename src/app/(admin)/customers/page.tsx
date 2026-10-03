import { Metadata } from 'next'
import { CustomersList } from '@/features/customers/components/CustomersList'
import { Can } from '@/components/shell/Can'
export const metadata: Metadata = {
  title: 'Customers | Zordr Admin',
  description: 'Manage customers across the platform.',
}

export default function CustomersPage() {
  return (
    <Can module="customers" action="view">
      <CustomersList />
    </Can>
  )
}