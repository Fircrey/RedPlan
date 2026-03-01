export const EARTH_RADIUS_METERS = 6_371_000

export const DEFAULT_SPACING_METERS = 100

export const DEFAULT_MAP_CENTER = { lat: 4.711, lng: -74.0721 } // Bogota
export const DEFAULT_MAP_ZOOM = 12

export const OSRM_BASE_URL = 'https://router.project-osrm.org'

export const POLE_COLORS = {
  start: '#22c55e',       // green-500
  intermediate: '#eab308', // yellow-500
  end: '#ef4444',          // red-500
} as const

export const POLE_STATUS_COLORS = {
  nuevo: '#ef4444',       // rojo
  existente: '#eab308',   // amarillo
  en_retiro: '#22c55e',   // verde
  cambiar: '#3b82f6',     // azul
} as const

export const POLE_STATUS_LABELS: Record<string, string> = {
  nuevo: 'Nuevo',
  existente: 'Existente',
  en_retiro: 'En retiro',
  cambiar: 'Cambiar',
} as const

export const LINE_SYMBOLOGY_CONFIG = {
  single: { label: '-x-', repeatCount: 1 },
  double: { label: '-xx-', repeatCount: 2 },
  triple: { label: '-xxx-', repeatCount: 3 },
} as const
