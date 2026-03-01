export interface LatLng {
  lat: number
  lng: number
}

export type PoleType = 'start' | 'intermediate' | 'end'
export type PoleStatus = 'nuevo' | 'existente' | 'en_retiro' | 'cambiar'
export type RouteMode = 'straight_line' | 'road_osrm' | 'road_google'
export type LineSymbology = 'single' | 'double' | 'triple'

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

export interface Project {
  id: string
  userId: string
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
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
