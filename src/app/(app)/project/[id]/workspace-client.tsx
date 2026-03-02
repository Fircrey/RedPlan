'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { MapProvider } from '@/components/providers/map-provider'
import { MapView } from '@/components/map/map-view'
import { Sidebar } from '@/components/sidebar/sidebar'
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

  const { saving, saved } = useAutoSaveRoute({
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

  const handleAddSegment = useCallback((segment: RouteSegment) => {
    setSegments((prev) => {
      const filtered = prev.filter(
        (s) => s.toPole <= segment.fromPole || s.fromPole >= segment.toPole,
      )
      return [...filtered, segment].sort((a, b) => a.fromPole - b.fromPole)
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
      // Refresh audit and comments
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

  const sidebarContent = (
    <Sidebar
      poles={poles}
      totalDistanceMeters={totalDistanceMeters}
      selectedPoleIndex={selectedPoleIndex}
      onSelectPole={setSelectedPoleIndex}
      onCalculate={handleCalculate}
      isCalculating={isCalculating}
      segments={segments}
      onAddSegment={handleAddSegment}
      onRemoveSegment={handleRemoveSegment}
      projectStatus={currentStatus}
      userRole={role}
      availableTransitions={availableTransitions}
      onTransition={handleTransition}
      transitioning={transitioning}
      budgetItems={budget.items}
      budgetLoading={budget.loading}
      budgetGrandTotal={budget.grandTotal}
      onAddBudgetItem={budget.addItem}
      onDeleteBudgetItem={budget.deleteItem}
      budgetEditable={budgetEditable}
      comments={commentsHook.comments}
      commentsLoading={commentsHook.loading}
      onAddComment={commentsHook.addComment}
      canComment={canComment}
      auditEntries={audit.entries}
      auditLoading={audit.loading}
      showAudit={showAudit}
    />
  )

  return (
    <div className="flex h-[calc(100vh-64px)] relative">
      {/* Auto-save indicator */}
      {(saving || saved) && (
        <div className={`absolute top-2 right-2 z-50 text-xs px-2 py-1 rounded shadow border ${
          saved
            ? 'bg-green-50 text-green-700 border-green-200'
            : 'bg-[var(--color-surface-secondary)] text-[var(--color-text)] border-[var(--color-border)]'
        }`}>
          {saving ? 'Guardando...' : 'Guardado \u2713'}
        </div>
      )}

      {/* Sidebar — desktop as panel, mobile as bottom sheet */}
      <MobileDrawer title="Calcular postes">
        {sidebarContent}
      </MobileDrawer>

      {/* Map — full height always */}
      <div className="flex-1 h-full">
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
