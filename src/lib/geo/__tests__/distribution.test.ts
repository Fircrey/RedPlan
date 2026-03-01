import { describe, it, expect } from 'vitest'
import { distributePolesStraightLine } from '../straight-line'
import { distributePolesAlongPolyline } from '../polyline-distribute'
import { haversineDistance } from '../haversine'

describe('distributePolesStraightLine', () => {
  it('places poles equidistantly along a straight line', () => {
    const origin = { lat: 4.60971, lng: -74.08175 }  // South Bogota
    const dest = { lat: 4.71099, lng: -74.07223 }    // North Bogota
    const spacing = 500

    const poles = distributePolesStraightLine(origin, dest, spacing)

    expect(poles.length).toBeGreaterThan(2)
    expect(poles[0].type).toBe('start')
    expect(poles[poles.length - 1].type).toBe('end')

    // Check spacing between consecutive poles (should be ~500m except last)
    for (let i = 0; i < poles.length - 2; i++) {
      const dist = haversineDistance(
        { lat: poles[i].lat, lng: poles[i].lng },
        { lat: poles[i + 1].lat, lng: poles[i + 1].lng },
      )
      expect(dist).toBeGreaterThan(450)
      expect(dist).toBeLessThan(550)
    }
  })

  it('handles single-pole case when distance < spacing', () => {
    const origin = { lat: 4.711, lng: -74.072 }
    const dest = { lat: 4.711, lng: -74.072 }
    const poles = distributePolesStraightLine(origin, dest, 100)
    expect(poles.length).toBe(1)
    expect(poles[0].type).toBe('start')
  })

  it('sequences numbers start at 1', () => {
    const origin = { lat: 0, lng: 0 }
    const dest = { lat: 0.01, lng: 0 }
    const poles = distributePolesStraightLine(origin, dest, 200)
    poles.forEach((pole, i) => {
      expect(pole.sequenceNumber).toBe(i + 1)
    })
  })
})

describe('distributePolesAlongPolyline', () => {
  it('places poles along a polyline following the path', () => {
    // L-shaped path: go east then north
    const points = [
      { lat: 0, lng: 0 },
      { lat: 0, lng: 0.009 },   // ~1km east
      { lat: 0.009, lng: 0.009 }, // ~1km north
    ]
    const spacing = 500

    const poles = distributePolesAlongPolyline(points, spacing)

    expect(poles.length).toBeGreaterThan(2)
    expect(poles[0].type).toBe('start')
    expect(poles[poles.length - 1].type).toBe('end')
    expect(poles[0].lat).toBeCloseTo(0, 4)
    expect(poles[0].lng).toBeCloseTo(0, 4)
  })

  it('handles empty points', () => {
    expect(distributePolesAlongPolyline([], 100)).toEqual([])
  })

  it('handles single point', () => {
    const poles = distributePolesAlongPolyline([{ lat: 1, lng: 2 }], 100)
    expect(poles.length).toBe(1)
    expect(poles[0].type).toBe('start')
  })
})
