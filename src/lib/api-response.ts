import { NextResponse } from 'next/server'

/** Standard API response shape */
interface ApiSuccessResponse<T> {
  data: T
  error?: never
}

interface ApiErrorResponse {
  data?: never
  error: string
  code?: string
}

type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ data } satisfies ApiResponse<T>, { status })
}

export function apiError(error: string, status = 400, code?: string) {
  return NextResponse.json(
    { error, ...(code ? { code } : {}) } satisfies ApiErrorResponse,
    { status },
  )
}

export function apiNotFound(message = 'Not found') {
  return apiError(message, 404)
}

export function apiUnauthorized(message = 'Unauthorized') {
  return apiError(message, 401)
}

export function apiForbidden(message = 'Forbidden') {
  return apiError(message, 403)
}

export function apiServerError(message = 'Internal server error') {
  return apiError(message, 500)
}
