import { LINE_SYMBOLOGY_CONFIG, POLE_STATUS_LABELS } from '@/lib/constants'
import type { Pole, RouteSegment } from '@/types'

export function exportPolesToCSV(
  poles: Pole[],
  segments: RouteSegment[] = [],
  filename = 'postes.csv',
) {
  const header = 'Numero;Latitud;Longitud;Tipo;Estado;Simbologia'
  const rows = poles.map((p) => {
    const seg = segments.find(
      (s) => p.sequenceNumber >= s.fromPole && p.sequenceNumber < s.toPole,
    )
    const symbology = seg ? LINE_SYMBOLOGY_CONFIG[seg.symbology].label : ''
    const statusLabel = POLE_STATUS_LABELS[p.status] || p.status
    return `${p.sequenceNumber};${p.lat};${p.lng};${p.type};${statusLabel};${symbology}`
  })
  const csv = [header, ...rows].join('\n')

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
