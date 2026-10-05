import { RefundsList } from '@/features/refunds/components/RefundsList'
import { Can } from '@/components/shell/Can'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Refunds | Zordr Admin'
}

export default function RefundsPage() {
  return (
    <Can module="refunds" action="view" fallback={<div className="p-8 text-center text-muted-foreground">You don&apos;t have permission to view refunds.</div>}>
      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Refunds</h1>
            <p className="text-muted-foreground mt-2">
              Manage and review event ticket refund requests
            </p>
          </div>
        </div>

        <RefundsList />
      </div>
    </Can>
  )
}