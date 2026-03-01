import { describe, it, expect } from 'vitest'
import { interpolate } from '../interpolate'

describe('interpolate', () => {
  const a = { lat: 0, lng: 0 }
  const b = { lat: 0, lng: 10 }

  it('returns start point at fraction 0', () => {
    const result = interpolate(a, b, 0)
    expect(result.lat).toBeCloseTo(a.lat, 6)
    expect(result.lng).toBeCloseTo(a.lng, 6)
  })

  it('returns end point at fraction 1', () => {
    const result = interpolate(a, b, 1)
    expect(result.lat).toBeCloseTo(b.lat, 6)
    expect(result.lng).toBeCloseTo(b.lng, 6)
  })

  it('returns midpoint at fraction 0.5', () => {
    const result = interpolate(a, b, 0.5)
    expect(result.lat).toBeCloseTo(0, 1)
    expect(result.lng).toBeCloseTo(5, 1)
  })

  it('works for same point', () => {
    const result = interpolate(a, a, 0.5)
    expect(result.lat).toBeCloseTo(a.lat, 6)
    expect(result.lng).toBeCloseTo(a.lng, 6)
  })
})
