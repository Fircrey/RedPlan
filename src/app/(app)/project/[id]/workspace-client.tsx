'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { MapProvider } from '@/components/providers/map-provider'
import { WorkspaceProvider } from '@/components/providers/workspace-provider'
import { MapView } from '@/components/map/map-view'
import { Sidebar } from '@/components/sidebar/sidebar'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { useCalculateRoute } from '@/hooks/use-calculate-route'
import { useProfile } from '@/hooks/use-profile'
import { useProjectWorkflow } from '@/hooks/use-project-workflow'
import { useBudget } from '@/hooks/use-budget'
import { useComments } from '@/hooks/use-comments'
import { useAudit } from '@/hooks/use-audit'
import { useProjectRoute } from '@/hooks/use-project-route'
import { useAutoSaveRoute } from '@/hooks/use-auto-save-route'
import { useToast } from '@/components/ui/toast'
import { Spinner } from '@/components/ui/spinner'
import { MobileDrawer } from '@/components/mobile-drawer'
import { haversineDistance } from '@/lib/geo/haversine'
import type { CalculateRequest, PoleStatus, RouteSegment, ProjectStatus, Project } from '@/types'

interface WorkspaceClientProps {
  project: Project
}

export function WorkspaceClient({ project }: WorkspaceClientProps) {
  const {
    poles,
    polylinePoints,
    totalDistanceMeters,
    isCalculating,
    error,
    lastRequest,
    calculate,
    setPoles,
    setPolylinePoints,
    setTotalDistanceMeters,
    setLastRequest,
  } = useCalculateRoute()

  const { data: savedRoute, loading: routeLoading } = useProjectRoute(project.id)
  const { profile, loading: profileLoading } = useProfile()
  const { getAvailableTransitions, transition, transitioning } = useProjectWorkflow(project.id)
  const budget = useBudget(project.id)
  const commentsHook = useComments(project.id)
  const audit = useAudit(project.id)

  const [selectedPoleIndex, setSelectedPoleIndex] = useState<number | null>(null)
  const [segments, setSegments] = useState<RouteSegment[]>([])
  const [currentStatus, setCurrentStatus] = useState<ProjectStatus>(project.status)
  const { toast } = useToast()
  const routeRestored = useRef(false)

  // Restore saved route data when loaded
  useEffect(() => {
    if (routeRestored.current || !savedRoute || poles.length > 0) return
    routeRestored.current = true
    setPoles(savedRoute.poles)
    setPolylinePoints(savedRoute.polylinePoints)
    setTotalDistanceMeters(savedRoute.totalDistanceMeters)
    setLastRequest(savedRoute.lastRequest)
    setSegments(savedRoute.segments)
  }, [savedRoute, poles.length, setPoles, setPolylinePoints, setTotalDistanceMeters, setLastRequest])

  const { saving, saved, saveError, dismissError } = useAutoSaveRoute({
    projectId: project.id,
    poles,
    polylinePoints,
    totalDistanceMeters,
    lastRequest,
    segments,
    routeRestored,
  })

  const role = profile?.role ?? 'supervisor'

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

  const handlePoleDrag = useCallback(
    (index: number, lat: number, lng: number) => {
      setPoles((prev) => {
        const updated = prev.map((p, i) =>
          i === index ? { ...p, lat, lng } : p,
        )
        // Recalculate total distance
        let total = 0
        for (let i = 0; i < updated.length - 1; i++) {
          total += haversineDistance(updated[i], updated[i + 1])
        }
        setTotalDistanceMeters(total)
        return updated
      })
    },
    [setPoles, setTotalDistanceMeters],
  )

  const handleAddSegment = useCallback((segment: RouteSegment) => {
    setSegments((prev) => {
      const result: RouteSegment[] = []
      for (const s of prev) {
        // No overlap — keep as-is
        if (s.toPole <= segment.fromPole || s.fromPole >= segment.toPole) {
          result.push(s)
          continue
        }
        // Existing segment completely inside new one — drop it
        if (s.fromPole >= segment.fromPole && s.toPole <= segment.toPole) {
          continue
        }
        // Existing segment contains the new one — split into two
        if (s.fromPole < segment.fromPole && s.toPole > segment.toPole) {
          result.push({ ...s, toPole: segment.fromPole })
          result.push({ ...s, fromPole: segment.toPole })
          continue
        }
        // Partial overlap on the left — trim right side
        if (s.fromPole < segment.fromPole) {
          result.push({ ...s, toPole: segment.fromPole })
          continue
        }
        // Partial overlap on the right — trim left side
        if (s.toPole > segment.toPole) {
          result.push({ ...s, fromPole: segment.toPole })
          continue
        }
      }
      return [...result, segment]
        .filter((s) => s.fromPole < s.toPole)
        .sort((a, b) => a.fromPole - b.fromPole)
    })
  }, [])

  const handleRemoveSegment = useCallback((index: number) => {
    setSegments((prev) => prev.filter((_, i) => i !== index))
  }, [])

  async function handleTransition(newStatus: ProjectStatus, comment?: string) {
    const result = await transition(newStatus, comment)
    if (result.success) {
      setCurrentStatus(newStatus)
      toast(`Estado actualizado a: ${newStatus}`, 'success')
      audit.refetch()
      commentsHook.refetch()
    }
    return result
  }

  if (error) {
    toast(error, 'error')
  }

  if (profileLoading || routeLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <Spinner size="lg" />
      </div>
    )
  }

  const availableTransitions = getAvailableTransitions(role, currentStatus)
  const budgetEditable =
    role === 'supervisor' && (currentStatus === 'borrador' || currentStatus === 'rechazado')
  const canComment = role !== 'administrador'
  const showAudit = role === 'gestor' || role === 'administrador'

  const workspaceValue = {
    poles,
    totalDistanceMeters,
    selectedPoleIndex,
    onSelectPole: setSelectedPoleIndex,
    onCalculate: handleCalculate,
    isCalculating,
    segments,
    onAddSegment: handleAddSegment,
    onRemoveSegment: handleRemoveSegment,
    projectStatus: currentStatus,
    userRole: role,
    availableTransitions,
    onTransition: handleTransition,
    transitioning,
    budgetItems: budget.items,
    budgetLoading: budget.loading,
    budgetGrandTotal: budget.grandTotal,
    onAddBudgetItem: budget.addItem,
    onDeleteBudgetItem: budget.deleteItem,
    budgetEditable,
    comments: commentsHook.comments,
    commentsLoading: commentsHook.loading,
    onAddComment: commentsHook.addComment,
    canComment,
    auditEntries: audit.entries,
    auditLoading: audit.loading,
    showAudit,
  }

  return (
    <WorkspaceProvider value={workspaceValue}>
      <div className="flex h-[calc(100vh-64px)] relative">
        {/* Auto-save indicator */}
        {(saving || saved) && (
          <div className={`absolute top-2 right-2 z-50 text-xs px-2 py-1 rounded shadow border ${
            saved
              ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)] border-[var(--color-primary)]'
              : 'bg-[var(--color-surface-secondary)] text-[var(--color-text)] border-[var(--color-border)]'
          }`}>
            {saving ? 'Guardando...' : 'Guardado \u2713'}
          </div>
        )}

        {/* Auto-save error */}
        {saveError && (
          <div className="absolute top-2 right-2 z-50 text-xs px-3 py-2 rounded shadow border bg-red-50 text-red-700 border-red-200 flex items-center gap-2">
            <span>{saveError}</span>
            <button
              onClick={dismissError}
              className="text-red-500 hover:text-red-700 font-bold"
              aria-label="Cerrar alerta"
            >
              &times;
            </button>
          </div>
        )}

        {/* Sidebar — desktop as panel, mobile as bottom sheet */}
        <ErrorBoundary>
          <MobileDrawer title="Calcular postes">
            <Sidebar />
          </MobileDrawer>
        </ErrorBoundary>

        {/* Map — full height always */}
        <div className="flex-1 h-full">
          <ErrorBoundary>
            <MapProvider>
              <MapView
                poles={poles}
                polylinePoints={polylinePoints}
                selectedPoleIndex={selectedPoleIndex}
                onSelectPole={setSelectedPoleIndex}
                onPoleStatusChange={handlePoleStatusChange}
                segments={segments}
                onPoleDrag={handlePoleDrag}
              />
            </MapProvider>
          </ErrorBoundary>
        </div>
      </div>
    </WorkspaceProvider>
  )
}
