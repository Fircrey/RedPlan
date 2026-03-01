'use client'

import { RouteInputForm } from './route-input-form'
import { ResultsPanel } from './results-panel'
import { ExportButton } from './export-button'
import { SaveRouteButton } from './save-route-button'
import { SegmentSelector } from './segment-selector'
import type { Pole, LatLng, RouteMode, CalculateRequest, RouteSegment } from '@/types'

interface SidebarProps {
  projectId: string
  poles: Pole[]
  polylinePoints: LatLng[]
  totalDistanceMeters: number
  selectedPoleIndex: number | null
  onSelectPole: (index: number | null) => void
  onCalculate: (data: CalculateRequest) => void
  isCalculating: boolean
  lastRequest: CalculateRequest | null
  segments: RouteSegment[]
  onAddSegment: (segment: RouteSegment) => void
  onRemoveSegment: (index: number) => void
}

export function Sidebar({
  projectId,
  poles,
  polylinePoints,
  totalDistanceMeters,
  selectedPoleIndex,
  onSelectPole,
  onCalculate,
  isCalculating,
  lastRequest,
  segments,
  onAddSegment,
  onRemoveSegment,
}: SidebarProps) {
  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900">Calcular postes</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <RouteInputForm onCalculate={onCalculate} isCalculating={isCalculating} />

        <ResultsPanel
          poles={poles}
          totalDistanceMeters={totalDistanceMeters}
          selectedPoleIndex={selectedPoleIndex}
          onSelectPole={onSelectPole}
        />

        {poles.length > 0 && (
          <SegmentSelector
            totalPoles={poles.length}
            segments={segments}
            onAddSegment={onAddSegment}
            onRemoveSegment={onRemoveSegment}
          />
        )}
      </div>

      {poles.length > 0 && (
        <div className="p-4 border-t border-gray-100 space-y-2">
          <ExportButton poles={poles} segments={segments} />
          {lastRequest && (
            <SaveRouteButton
              projectId={projectId}
              poles={poles}
              originLat={lastRequest.originLat}
              originLng={lastRequest.originLng}
              destLat={lastRequest.destLat}
              destLng={lastRequest.destLng}
              spacingMeters={lastRequest.spacingMeters}
              mode={lastRequest.mode}
              polylinePoints={polylinePoints}
              totalDistanceMeters={totalDistanceMeters}
            />
          )}
        </div>
      )}
    </div>
  )
}
