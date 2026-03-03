import { LINE_SYMBOLOGY_CONFIG, POLE_STATUS_LABELS } from '@/lib/constants'
import type { Pole, RouteSegment } from '@/types'

/** Escape a CSV field value for semicolon-delimited files */
export function escapeCSVField(value: string): string {
  if (value.includes(';') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

/** Build CSV string content from poles and segments (pure function, no DOM) */
export function buildCSVContent(
  poles: Pole[],
  segments: RouteSegment[] = [],
): string {
  const header = 'Numero;Latitud;Longitud;Tipo;Estado;Simbologia'
  const rows = poles.map((p) => {
    const seg = segments.find(
      (s) => p.sequenceNumber >= s.fromPole && p.sequenceNumber < s.toPole,
    )
    const symbology = seg ? LINE_SYMBOLOGY_CONFIG[seg.symbology].label : ''
    const statusLabel = POLE_STATUS_LABELS[p.status] || p.status
    return [
      String(p.sequenceNumber),
      p.lat.toFixed(6),
      p.lng.toFixed(6),
      escapeCSVField(p.type),
      escapeCSVField(statusLabel),
      escapeCSVField(symbology),
    ].join(';')
  })
  return [header, ...rows].join('\n')
}

export function exportPolesToCSV(
  poles: Pole[],
  segments: RouteSegment[] = [],
  filename = 'postes.csv',
) {
  const csv = buildCSVContent(poles, segments)

  // BOM UTF-8 for Excel compatibility
  const bom = '\uFEFF'
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
