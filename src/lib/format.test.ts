import { describe, it, expect } from 'vitest'
import { formatInr, formatNumber } from './format'

describe('format.ts', () => {
  it('formats INR correctly with Indian grouping', () => {
    expect(formatInr(124560)).toBe('₹1,24,560')
    expect(formatInr(248000)).toBe('₹2,48,000')
    expect(formatInr(0)).toBe('₹0')
    expect(formatInr(-5000)).toBe('-₹5,000')
  })

  it('formats compact INR correctly', () => {
    expect(formatInr(1240000, true)).toBe('₹12.4L')
    expect(formatInr(12000000, true)).toBe('₹1.2Cr')
    expect(formatInr(500, true)).toBe('₹500')
    expect(formatInr(1500, true)).toBe('₹1.5K')
  })

  it('formats standard numbers correctly', () => {
    expect(formatNumber(124560)).toBe('1,24,560')
    expect(formatNumber(124560, true)).toBe('1.2L')
  })
})
