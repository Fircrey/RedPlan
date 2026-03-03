import { describe, it, expect } from 'vitest'
import { apiSuccess, apiError, apiNotFound, apiUnauthorized, apiForbidden, apiServerError } from '../api-response'

describe('apiSuccess', () => {
  it('returns 200 with data by default', async () => {
    const res = apiSuccess({ id: '1' })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data).toEqual({ id: '1' })
  })

  it('supports custom status', async () => {
    const res = apiSuccess({ created: true }, 201)
    expect(res.status).toBe(201)
  })
})

describe('apiError', () => {
  it('returns 400 by default', async () => {
    const res = apiError('Bad input')
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('Bad input')
  })

  it('supports custom status and code', async () => {
    const res = apiError('Not allowed', 403, 'FORBIDDEN')
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.code).toBe('FORBIDDEN')
  })
})

describe('convenience helpers', () => {
  it('apiNotFound returns 404', () => {
    expect(apiNotFound().status).toBe(404)
  })

  it('apiUnauthorized returns 401', () => {
    expect(apiUnauthorized().status).toBe(401)
  })

  it('apiForbidden returns 403', () => {
    expect(apiForbidden().status).toBe(403)
  })

  it('apiServerError returns 500', () => {
    expect(apiServerError().status).toBe(500)
  })
})
