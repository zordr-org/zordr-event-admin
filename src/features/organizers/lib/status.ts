import type { OrganizerStatus } from '../types'

export type OrganizerAction = 'approve' | 'reject' | 'suspend'

export function getAvailableActions(status: OrganizerStatus): OrganizerAction[] {
  switch (status) {
    case 'pending':
      return ['approve', 'reject']
    case 'approved':
      return ['suspend']
    case 'rejected':
    case 'suspended':
    default:
      return []
  }
}

export function isValidTransition(from: OrganizerStatus, action: OrganizerAction): boolean {
  return getAvailableActions(from).includes(action)
}
