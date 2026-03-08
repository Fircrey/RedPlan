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

export const LINE_COLOR = '#eab308' // yellow-500

export const LINE_SYMBOLOGY_COLORS = {
  single: '#eab308',  // amarillo (actual)
  double: '#3b82f6',  // azul
  triple: '#ef4444',  // rojo
} as const

export const LINE_SYMBOLOGY_CONFIG = {
  single: { label: '-x-', repeatCount: 1, symbolOffsets: [0.5], gapFraction: 0.06 },
  double: { label: '-xx-', repeatCount: 2, symbolOffsets: [0.46, 0.54], gapFraction: 0.12 },
  triple: { label: '-xxx-', repeatCount: 3, symbolOffsets: [0.42, 0.50, 0.58], gapFraction: 0.18 },
} as const

import type { UserRole, ProjectStatus } from '@/types'

export const PROJECT_STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; color: string; bgColor: string }
> = {
  borrador: { label: 'Borrador', color: '#6b7280', bgColor: '#f3f4f6' },
  pendiente_coordinador: { label: 'Pendiente coordinador', color: '#d97706', bgColor: '#fef3c7' },
  rechazado: { label: 'Rechazado', color: '#dc2626', bgColor: '#fee2e2' },
  pendiente_gestor: { label: 'Pendiente gestor', color: '#7c3aed', bgColor: '#ede9fe' },
  contratado: { label: 'Contratado', color: '#2563eb', bgColor: '#dbeafe' },
  en_ejecucion: { label: 'En ejecucion', color: '#059669', bgColor: '#d1fae5' },
  pendiente_conciliacion: { label: 'Pendiente conciliacion', color: '#ea580c', bgColor: '#fff7ed' },
  en_correccion: { label: 'En correccion', color: '#dc2626', bgColor: '#fef2f2' },
  finalizado: { label: 'Finalizado', color: '#16a34a', bgColor: '#dcfce7' },
} as const

export const ROLE_LABELS: Record<UserRole, string> = {
  supervisor: 'Supervisor de proyecto',
  coordinador: 'Coordinador de proyecto',
  gestor: 'Gestor de contrato',
  administrador: 'Administrador',
} as const

export const STATUS_TRANSITIONS: Partial<
  Record<UserRole, Partial<Record<ProjectStatus, ProjectStatus[]>>>
> = {
  supervisor: {
    borrador: ['pendiente_coordinador'],
    rechazado: ['pendiente_coordinador'],
  },
  coordinador: {
    pendiente_coordinador: ['pendiente_gestor', 'rechazado'],
  },
  gestor: {
    pendiente_gestor: ['contratado'],
    contratado: ['en_ejecucion'],
    en_ejecucion: ['pendiente_conciliacion'],
    pendiente_conciliacion: ['finalizado', 'en_correccion'],
    en_correccion: ['pendiente_conciliacion'],
  },
} as const

export const BUDGET_UNITS = ['und', 'ml', 'kg', 'gl', 'm', 'm2', 'm3'] as const
