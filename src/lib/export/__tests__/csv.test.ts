import { describe, it, expect } from 'vitest'
import { escapeCSVField, buildCSVContent } from '../csv'

describe('escapeCSVField', () => {
  it('returns plain text unchanged', () => {
    expect(escapeCSVField('hello')).toBe('hello')
  })

  it('wraps field containing semicolons in quotes', () => {
    expect(escapeCSVField('foo;bar')).toBe('"foo;bar"')
  })

  it('wraps field containing double quotes and escapes them', () => {
    expect(escapeCSVField('say "hi"')).toBe('"say ""hi"""')
  })

  it('wraps field containing newlines', () => {
    expect(escapeCSVField('line1\nline2')).toBe('"line1\nline2"')
  })

  it('wraps field containing carriage return', () => {
    expect(escapeCSVField('line1\rline2')).toBe('"line1\rline2"')
  })

  it('handles combined special chars', () => {
    expect(escapeCSVField('a;b"c\nd')).toBe('"a;b""c\nd"')
  })
})

describe('buildCSVContent', () => {
  it('generates correct header', () => {
    const csv = buildCSVContent([], [])
    expect(csv).toContain('Numero;Latitud;Longitud;Tipo;Estado;Simbologia')
  })

  it('generates rows for poles', () => {
    const poles = [
      { sequenceNumber: 1, lat: 4.711, lng: -74.072, type: 'start' as const, status: 'nuevo' as const },
      { sequenceNumber: 2, lat: 4.712, lng: -74.073, type: 'intermediate' as const, status: 'existente' as const },
    ]
    const csv = buildCSVContent(poles, [])
    const lines = csv.split('\n')
    expect(lines.length).toBe(3) // header + 2 rows
    expect(lines[1]).toContain('4.711000')
    expect(lines[1]).toContain('Nuevo')
    expect(lines[2]).toContain('Existente')
  })

  it('includes symbology from segments', () => {
    const poles = [
      { sequenceNumber: 1, lat: 4.711, lng: -74.072, type: 'start' as const, status: 'nuevo' as const },
    ]
    const segments = [
      { fromPole: 1, toPole: 5, symbology: 'single' as const },
    ]
    const csv = buildCSVContent(poles, segments)
    expect(csv).toContain('-x-')
  })
})
