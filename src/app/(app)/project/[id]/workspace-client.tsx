'use client'

import { useState, useCallback } from 'react'
import { MapProvider } from '@/components/providers/map-provider'
import { MapView } from '@/components/map/map-view'
import { Sidebar } from '@/components/sidebar/sidebar'
import { useCalculateRoute } from '@/hooks/use-calculate-route'
import { useToast } from '@/components/ui/toast'
import type { CalculateRequest, PoleStatus, RouteSegment } from '@/types'

interface WorkspaceClientProps {
  projectId: string
  projectName: string
}

export function WorkspaceClient({ projectId, projectName }: WorkspaceClientProps) {
  const {
    poles,
    polylinePoints,
    totalDistanceMeters,
    isCalculating,
    error,
    lastRequest,
    calculate,
    setPoles,
  } = useCalculateRoute()

  const [selectedPoleIndex, setSelectedPoleIndex] = useState<number | null>(null)
  const [segments, setSegments] = useState<RouteSegment[]>([])
  const { toast } = useToast()

  async function handleCalculate(data: CalculateRequest) {
    setSelectedPoleIndex(null)
    setSegments([])
    await calculate(data)
  }

  const handlePoleStatusChange = useCallback(
    (index: number, newStatus: PoleStatus) => {
      setPoles((prev) =>
        prev.map((p, i) => (i === index ? { ...p, status: newStatus } : p)),
      )
    },
    [setPoles],
  )

  const handleAddSegment = useCallback((segment: RouteSegment) => {
    setSegments((prev) => {
      // Remove overlapping segments, then add the new one
      const filtered = prev.filter(
        (s) => s.toPole <= segment.fromPole || s.fromPole >= segment.toPole,
      )
      return [...filtered, segment].sort((a, b) => a.fromPole - b.fromPole)
    })
  }, [])

  const handleRemoveSegment = useCallback((index: number) => {
    setSegments((prev) => prev.filter((_, i) => i !== index))
  }, [])

  if (error) {
    toast(error, 'error')
  }

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <div className="w-full md:w-96 md:flex-shrink-0 md:border-r border-gray-200 overflow-hidden order-2 md:order-1 max-h-[50vh] md:max-h-none">
        <Sidebar
          projectId={projectId}
          poles={poles}
          polylinePoints={polylinePoints}
          totalDistanceMeters={totalDistanceMeters}
          selectedPoleIndex={selectedPoleIndex}
          onSelectPole={setSelectedPoleIndex}
          onCalculate={handleCalculate}
          isCalculating={isCalculating}
          lastRequest={lastRequest}
          segments={segments}
          onAddSegment={handleAddSegment}
          onRemoveSegment={handleRemoveSegment}
        />
      </div>

      {/* Map */}
      <div className="flex-1 order-1 md:order-2 min-h-[50vh] md:min-h-0">
        <MapProvider>
          <MapView
            poles={poles}
            polylinePoints={polylinePoints}
            selectedPoleIndex={selectedPoleIndex}
            onSelectPole={setSelectedPoleIndex}
            onPoleStatusChange={handlePoleStatusChange}
            segments={segments}
          />
        </MapProvider>
      </div>
    </div>
  )
}
