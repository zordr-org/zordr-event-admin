import { describe, it, expect } from 'vitest'
import { getAvailableActions, isValidTransition } from './status'

describe('Organizer status transitions', () => {
  it('returns approve and reject for pending', () => {
    expect(getAvailableActions('pending')).toEqual(['approve', 'reject'])
  })

  it('returns suspend for approved', () => {
    expect(getAvailableActions('approved')).toEqual(['suspend'])
  })

  it('returns no actions for rejected', () => {
    expect(getAvailableActions('rejected')).toEqual([])
  })

  it('returns no actions for suspended', () => {
    expect(getAvailableActions('suspended')).toEqual([])
  })

  it('validates transitions correctly', () => {
    expect(isValidTransition('pending', 'approve')).toBe(true)
    expect(isValidTransition('pending', 'reject')).toBe(true)
    expect(isValidTransition('pending', 'suspend')).toBe(false)

    expect(isValidTransition('approved', 'suspend')).toBe(true)
    expect(isValidTransition('approved', 'approve')).toBe(false)
    expect(isValidTransition('approved', 'reject')).toBe(false)

    expect(isValidTransition('suspended', 'approve')).toBe(false)
    expect(isValidTransition('rejected', 'suspend')).toBe(false)
  })
})
