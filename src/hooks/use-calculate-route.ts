'use client'

import { useState, type Dispatch, type SetStateAction } from 'react'
import type { CalculateRequest, CalculateResponse, Pole, LatLng } from '@/types'

interface UseCalculateRouteReturn {
  poles: Pole[]
  setPoles: Dispatch<SetStateAction<Pole[]>>
  polylinePoints: LatLng[]
  setPolylinePoints: Dispatch<SetStateAction<LatLng[]>>
  totalDistanceMeters: number
  setTotalDistanceMeters: Dispatch<SetStateAction<number>>
  isCalculating: boolean
  error: string | null
  lastRequest: CalculateRequest | null
  setLastRequest: Dispatch<SetStateAction<CalculateRequest | null>>
  calculate: (data: CalculateRequest) => Promise<void>
  reset: () => void
}

export function useCalculateRoute(): UseCalculateRouteReturn {
  const [poles, setPoles] = useState<Pole[]>([])
  const [polylinePoints, setPolylinePoints] = useState<LatLng[]>([])
  const [totalDistanceMeters, setTotalDistanceMeters] = useState(0)
  const [isCalculating, setIsCalculating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastRequest, setLastRequest] = useState<CalculateRequest | null>(null)

  async function calculate(data: CalculateRequest) {
    setIsCalculating(true)
    setError(null)

    try {
      const res = await fetch('/api/route/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error || 'Error en el calculo')
      }

      // API returns { data: CalculateResponse } with standardized wrapper
      const response = (json.data ?? json) as CalculateResponse
      setPoles(response.poles)
      setPolylinePoints(response.polylinePoints)
      setTotalDistanceMeters(response.totalDistanceMeters)
      setLastRequest(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsCalculating(false)
    }
  }

  function reset() {
    setPoles([])
    setPolylinePoints([])
    setTotalDistanceMeters(0)
    setError(null)
    setLastRequest(null)
  }

  return {
    poles,
    setPoles,
    polylinePoints,
    setPolylinePoints,
    totalDistanceMeters,
    setTotalDistanceMeters,
    isCalculating,
    error,
    lastRequest,
    setLastRequest,
    calculate,
    reset,
  }
}
