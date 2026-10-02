import type { Metadata } from 'next'
import { OrdersList } from '@/features/orders/components/OrdersList'
import { Can } from '@/components/shell/Can'

export const metadata: Metadata = {
  title: 'Orders | Zordr Admin Portal',
  robots: { index: false, follow: false },
}

export default function OrdersPage() {
  return (
    <Can module="orders" action="view">
      <OrdersList />
    </Can>
  )
}