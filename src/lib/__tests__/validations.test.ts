import { describe, it, expect } from 'vitest'
import {
  calculateRequestSchema,
  budgetItemCreateSchema,
  budgetItemUpdateSchema,
  commentCreateSchema,
  routeSaveSchema,
  projectUpdateSchema,
  statusTransitionSchema,
  paginationSchema,
} from '../validations'

describe('calculateRequestSchema', () => {
  it('accepts valid input', () => {
    const result = calculateRequestSchema.safeParse({
      originLat: 4.711,
      originLng: -74.0721,
      destLat: 4.72,
      destLng: -74.08,
      spacingMeters: 100,
      mode: 'road_osrm',
    })
    expect(result.success).toBe(true)
  })

  it('rejects latitude out of range', () => {
    const result = calculateRequestSchema.safeParse({
      originLat: 91,
      originLng: -74.0721,
      destLat: 4.72,
      destLng: -74.08,
      spacingMeters: 100,
      mode: 'road_osrm',
    })
    expect(result.success).toBe(false)
  })

  it('rejects longitude out of range', () => {
    const result = calculateRequestSchema.safeParse({
      originLat: 4.711,
      originLng: -181,
      destLat: 4.72,
      destLng: -74.08,
      spacingMeters: 100,
      mode: 'road_osrm',
    })
    expect(result.success).toBe(false)
  })

  it('rejects zero spacing', () => {
    const result = calculateRequestSchema.safeParse({
      originLat: 4.711,
      originLng: -74.0721,
      destLat: 4.72,
      destLng: -74.08,
      spacingMeters: 0,
      mode: 'road_osrm',
    })
    expect(result.success).toBe(false)
  })

  it('rejects negative spacing', () => {
    const result = calculateRequestSchema.safeParse({
      originLat: 4.711,
      originLng: -74.0721,
      destLat: 4.72,
      destLng: -74.08,
      spacingMeters: -10,
      mode: 'straight_line',
    })
    expect(result.success).toBe(false)
  })

  it('rejects spacing over 10000m', () => {
    const result = calculateRequestSchema.safeParse({
      originLat: 4.711,
      originLng: -74.0721,
      destLat: 4.72,
      destLng: -74.08,
      spacingMeters: 10001,
      mode: 'straight_line',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid mode', () => {
    const result = calculateRequestSchema.safeParse({
      originLat: 4.711,
      originLng: -74.0721,
      destLat: 4.72,
      destLng: -74.08,
      spacingMeters: 100,
      mode: 'invalid_mode',
    })
    expect(result.success).toBe(false)
  })

  it('rejects string coordinates', () => {
    const result = calculateRequestSchema.safeParse({
      originLat: '4.711',
      originLng: -74.0721,
      destLat: 4.72,
      destLng: -74.08,
      spacingMeters: 100,
      mode: 'road_osrm',
    })
    expect(result.success).toBe(false)
  })
})

describe('budgetItemCreateSchema', () => {
  it('accepts valid input', () => {
    const result = budgetItemCreateSchema.safeParse({
      description: 'Poste de madera',
      quantity: 10,
      unit: 'und',
      unit_cost: 50000,
    })
    expect(result.success).toBe(true)
  })

  it('trims whitespace from description', () => {
    const result = budgetItemCreateSchema.safeParse({
      description: '  Poste  ',
      quantity: 1,
      unit: 'und',
      unit_cost: 100,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.description).toBe('Poste')
    }
  })

  it('rejects empty description', () => {
    const result = budgetItemCreateSchema.safeParse({
      description: '   ',
      quantity: 10,
      unit: 'und',
      unit_cost: 50000,
    })
    expect(result.success).toBe(false)
  })

  it('rejects zero quantity', () => {
    const result = budgetItemCreateSchema.safeParse({
      description: 'Poste',
      quantity: 0,
      unit: 'und',
      unit_cost: 50000,
    })
    expect(result.success).toBe(false)
  })

  it('rejects negative unit cost', () => {
    const result = budgetItemCreateSchema.safeParse({
      description: 'Poste',
      quantity: 10,
      unit: 'und',
      unit_cost: -1,
    })
    expect(result.success).toBe(false)
  })
})

describe('budgetItemUpdateSchema', () => {
  it('accepts partial update', () => {
    const result = budgetItemUpdateSchema.safeParse({ quantity: 5 })
    expect(result.success).toBe(true)
  })

  it('accepts empty object', () => {
    const result = budgetItemUpdateSchema.safeParse({})
    expect(result.success).toBe(true)
  })
})

describe('commentCreateSchema', () => {
  it('accepts valid comment', () => {
    const result = commentCreateSchema.safeParse({ content: 'Buen trabajo' })
    expect(result.success).toBe(true)
  })

  it('rejects empty comment', () => {
    const result = commentCreateSchema.safeParse({ content: '   ' })
    expect(result.success).toBe(false)
  })

  it('rejects comment over 5000 chars', () => {
    const result = commentCreateSchema.safeParse({ content: 'a'.repeat(5001) })
    expect(result.success).toBe(false)
  })
})

describe('routeSaveSchema', () => {
  it('accepts valid route with poles and segments', () => {
    const result = routeSaveSchema.safeParse({
      originLat: 4.711,
      originLng: -74.0721,
      destLat: 4.72,
      destLng: -74.08,
      spacingMeters: 100,
      mode: 'road_osrm',
      totalDistanceMeters: 1000,
      totalPoles: 11,
      poles: [
        { sequenceNumber: 1, lat: 4.711, lng: -74.0721, type: 'start', status: 'nuevo' },
      ],
      segments: [
        { fromPole: 1, toPole: 5, symbology: 'single' },
      ],
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid pole status', () => {
    const result = routeSaveSchema.safeParse({
      originLat: 4.711,
      originLng: -74.0721,
      destLat: 4.72,
      destLng: -74.08,
      spacingMeters: 100,
      mode: 'road_osrm',
      totalDistanceMeters: 1000,
      totalPoles: 1,
      poles: [
        { sequenceNumber: 1, lat: 4.711, lng: -74.0721, type: 'start', status: 'invalid' },
      ],
      segments: [],
    })
    expect(result.success).toBe(false)
  })
})

describe('projectUpdateSchema', () => {
  it('accepts valid update', () => {
    const result = projectUpdateSchema.safeParse({
      name: 'My Project',
      description: 'A project',
    })
    expect(result.success).toBe(true)
  })

  it('accepts null description', () => {
    const result = projectUpdateSchema.safeParse({ description: null })
    expect(result.success).toBe(true)
  })

  it('rejects name over 200 chars', () => {
    const result = projectUpdateSchema.safeParse({ name: 'x'.repeat(201) })
    expect(result.success).toBe(false)
  })
})

describe('statusTransitionSchema', () => {
  it('accepts valid transition', () => {
    const result = statusTransitionSchema.safeParse({
      status: 'pendiente_coordinador',
    })
    expect(result.success).toBe(true)
  })

  it('accepts transition with comment', () => {
    const result = statusTransitionSchema.safeParse({
      status: 'rechazado',
      comment: 'Needs more detail',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid status', () => {
    const result = statusTransitionSchema.safeParse({
      status: 'invalid_status',
    })
    expect(result.success).toBe(false)
  })
})

describe('paginationSchema', () => {
  it('uses defaults when empty', () => {
    const result = paginationSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.limit).toBe(50)
      expect(result.data.offset).toBe(0)
    }
  })

  it('coerces strings to numbers', () => {
    const result = paginationSchema.safeParse({ limit: '20', offset: '10' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.limit).toBe(20)
      expect(result.data.offset).toBe(10)
    }
  })

  it('rejects limit over 100', () => {
    const result = paginationSchema.safeParse({ limit: 101 })
    expect(result.success).toBe(false)
  })
})
