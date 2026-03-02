export interface LatLng {
  lat: number
  lng: number
}

export type PoleType = 'start' | 'intermediate' | 'end'
export type PoleStatus = 'nuevo' | 'existente' | 'en_retiro' | 'cambiar'
export type RouteMode = 'straight_line' | 'road_osrm' | 'road_google'
export type LineSymbology = 'single' | 'double' | 'triple'

export type UserRole = 'supervisor' | 'coordinador' | 'gestor' | 'administrador'
export type ProjectStatus =
  | 'borrador'
  | 'pendiente_coordinador'
  | 'rechazado'
  | 'pendiente_gestor'
  | 'contratado'
  | 'en_ejecucion'
  | 'pendiente_conciliacion'
  | 'en_correccion'
  | 'finalizado'

export interface Pole {
  sequenceNumber: number
  lat: number
  lng: number
  type: PoleType
  status: PoleStatus
}

export interface PoleStatusInfo {
  label: string
  color: string
}

export interface RouteSegment {
  fromPole: number
  toPole: number
  symbology: LineSymbology
}

export interface CalculateRequest {
  originLat: number
  originLng: number
  destLat: number
  destLng: number
  spacingMeters: number
  mode: RouteMode
}

export interface CalculateResponse {
  poles: Pole[]
  polylinePoints: LatLng[]
  totalDistanceMeters: number
  totalPoles: number
}

export interface UserProfile {
  id: string
  email: string
  role: UserRole
  zoneId: string | null
  fullName: string | null
}

export interface Zone {
  id: string
  name: string
  description: string | null
}

export interface Project {
  id: string
  userId: string
  name: string
  description: string | null
  status: ProjectStatus
  zoneId: string | null
  createdAt: string
  updatedAt: string
}

export interface BudgetItem {
  id: string
  projectId: string
  description: string
  quantity: number
  unit: string
  unitCost: number
  total: number
}

export interface ProjectComment {
  id: string
  projectId: string
  authorId: string
  authorEmail?: string
  authorRole?: UserRole
  content: string
  createdAt: string
}

export interface AuditEntry {
  id: string
  projectId: string | null
  userId: string
  userEmail?: string
  action: string
  details: Record<string, unknown>
  createdAt: string
}

export interface Route {
  id: string
  projectId: string
  name: string
  originLat: number
  originLng: number
  destLat: number
  destLng: number
  spacingMeters: number
  mode: RouteMode
  polylineEncoded: string | null
  totalDistanceMeters: number
  totalPoles: number
  createdAt: string
}

export interface RouteWithPoles extends Route {
  poles: Pole[]
}

export interface RouteProviderResult {
  polylinePoints: LatLng[]
  totalDistanceMeters: number
}
