import type { RefundListItem } from './types'
import { mockOrdersList } from '@/features/orders/api'
import { mockSettlementsList } from '@/features/settlements/api'

import { store } from '@/mocks/store'

export const mockRefundsList = store.refunds
