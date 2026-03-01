import { describe, it, expect } from 'vitest'
import { haversineDistance } from '../haversine'

describe('haversineDistance', () => {
  it('returns 0 for the same point', () => {
    const p = { lat: 4.711, lng: -74.0721 }
    expect(haversineDistance(p, p)).toBeCloseTo(0, 5)
  })

  it('calculates distance between known points (Bogota to Medellin ~415 km)', () => {
    const bogota = { lat: 4.711, lng: -74.0721 }
    const medellin = { lat: 6.2442, lng: -75.5812 }
    const distance = haversineDistance(bogota, medellin)
    // Approximately 415 km
    expect(distance).toBeGreaterThan(200_000)
    expect(distance).toBeLessThan(250_000)
  })

  it('calculates short distance accurately (~100m)', () => {
    // Two points ~100m apart along a longitude line near the equator
    const a = { lat: 0, lng: 0 }
    const b = { lat: 0.0009, lng: 0 } // ~100m
    const distance = haversineDistance(a, b)
    expect(distance).toBeGreaterThan(90)
    expect(distance).toBeLessThan(110)
  })

  it('is symmetric', () => {
    const a = { lat: 4.711, lng: -74.0721 }
    const b = { lat: 6.2442, lng: -75.5812 }
    expect(haversineDistance(a, b)).toBeCloseTo(haversineDistance(b, a), 5)
  })
})
