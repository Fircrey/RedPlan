import { z } from 'zod'

// --- Coordinate and Geo schemas ---

const latitude = z.number().min(-90).max(90)
const longitude = z.number().min(-180).max(180)

export const calculateRequestSchema = z.object({
  originLat: latitude,
  originLng: longitude,
  destLat: latitude,
  destLng: longitude,
  spacingMeters: z.number().gt(0).max(10_000),
  mode: z.enum(['straight_line', 'road_osrm', 'road_google']),
})

// --- Route save schemas ---

const poleStatusSchema = z.enum(['nuevo', 'existente', 'en_retiro', 'cambiar'])
const poleTypeSchema = z.enum(['start', 'intermediate', 'end'])
const lineSymbologySchema = z.enum(['single', 'double', 'triple'])

const poleSchema = z.object({
  sequenceNumber: z.number().int().positive(),
  lat: latitude,
  lng: longitude,
  type: poleTypeSchema,
  status: poleStatusSchema,
})

const segmentSchema = z.object({
  fromPole: z.number().int().positive(),
  toPole: z.number().int().positive(),
  symbology: lineSymbologySchema,
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
})

export const routeSaveSchema = z.object({
  originLat: latitude,
  originLng: longitude,
  destLat: latitude,
  destLng: longitude,
  spacingMeters: z.number().gt(0).max(10_000),
  mode: z.enum(['straight_line', 'road_osrm', 'road_google']),
  polylineEncoded: z.string().nullable().optional(),
  totalDistanceMeters: z.number().nonnegative(),
  totalPoles: z.number().int().nonnegative(),
  poles: z.array(poleSchema).max(50_000).default([]),
  segments: z.array(segmentSchema).max(50_000).default([]),
})

// --- Budget schemas ---

export const budgetItemCreateSchema = z.object({
  description: z.string().trim().min(1, 'Description is required').max(500),
  quantity: z.number().positive('Quantity must be positive').max(1_000_000_000),
  unit: z.string().trim().min(1).max(20),
  unit_cost: z.number().min(0, 'Unit cost must be non-negative').max(1_000_000_000_000),
})

export const budgetItemUpdateSchema = z.object({
  description: z.string().trim().min(1).max(500).optional(),
  quantity: z.number().positive().max(1_000_000_000).optional(),
  unit: z.string().trim().min(1).max(20).optional(),
  unit_cost: z.number().min(0).max(1_000_000_000_000).optional(),
})

// --- Comment schemas ---

export const commentCreateSchema = z.object({
  content: z.string().trim().min(1, 'Content is required').max(5000),
})

// --- Project schemas ---

export const projectUpdateSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(2000).nullable().optional(),
})

// --- Status transition schema ---

export const statusTransitionSchema = z.object({
  status: z.enum([
    'borrador',
    'pendiente_coordinador',
    'rechazado',
    'pendiente_gestor',
    'contratado',
    'en_ejecucion',
    'pendiente_conciliacion',
    'en_correccion',
    'finalizado',
  ]),
  comment: z.string().trim().max(5000).optional(),
})

// --- Pagination ---

export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
})

// --- Max pole count constant ---

export const MAX_POLE_COUNT = 50_000
