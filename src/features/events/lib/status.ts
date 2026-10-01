import type { EventStatus } from '../types'

export type EventAction = 'review' | 'view' | 'approve' | 'send_back' | 'reject'

/** Actions available in the list row based on status */
export function getRowAction(status: EventStatus): 'review' | 'view' {
  return status === 'pending_review' || status === 'submitted' ? 'review' : 'view'
}

/** Determine which review actions are available given current event status */
export function getReviewActions(status: EventStatus): EventAction[] {
  switch (status) {
    case 'pending_review':
    case 'submitted':
      return ['approve', 'send_back', 'reject']
    default:
      return []
  }
}

/** Returns true only when every checklist item is 'looks_good' */
export function isChecklistComplete(
  checklist: Array<{ status: 'pending' | 'looks_good' | 'flagged' }>
): boolean {
  return checklist.length > 0 && checklist.every((item) => item.status === 'looks_good')
}

/** Returns labels of checklist items that are blocking approval */
export function getBlockingItems(
  checklist: Array<{ label: string; status: 'pending' | 'looks_good' | 'flagged' }>
): string[] {
  return checklist.filter((item) => item.status !== 'looks_good').map((item) => item.label)
}

export function isTerminalStatus(status: EventStatus): boolean {
  return status === 'rejected' || status === 'cancelled'
}
