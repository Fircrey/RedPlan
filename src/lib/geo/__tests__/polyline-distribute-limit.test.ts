import { describe, it, expect } from 'vitest'
import { distributePolesAlongPolyline } from '../polyline-distribute'

describe('distributePolesAlongPolyline limits', () => {
  it('throws when pole count exceeds 50,000', () => {
    // Two points very far apart with very small spacing would exceed limit
    const points = [
      { lat: 0, lng: 0 },
      { lat: 10, lng: 10 }, // ~1,568 km apart
    ]
    const spacingMeters = 0.01 // extremely small spacing

    expect(() => distributePolesAlongPolyline(points, spacingMeters)).toThrow(
      /Too many poles/,
    )
  })

  it('works fine within normal limits', () => {
    const points = [
      { lat: 4.711, lng: -74.072 },
      { lat: 4.712, lng: -74.073 },
    ]
    const poles = distributePolesAlongPolyline(points, 50)
    expect(poles.length).toBeGreaterThan(0)
    expect(poles.length).toBeLessThan(50_000)
  })
})
