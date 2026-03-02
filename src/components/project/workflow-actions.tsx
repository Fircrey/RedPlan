'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { StatusBadge } from '@/components/ui/status-badge'
import { RejectDialog } from './reject-dialog'
import { ConciliationDialog } from './conciliation-dialog'
import type { ProjectStatus, UserRole } from '@/types'

interface WorkflowActionsProps {
  projectStatus: ProjectStatus
  userRole: UserRole
  availableTransitions: ProjectStatus[]
  onTransition: (newStatus: ProjectStatus, comment?: string) => Promise<{ success: boolean; error: string | null }>
  transitioning: boolean
}

const TRANSITION_LABELS: Partial<Record<ProjectStatus, string>> = {
  pendiente_coordinador: 'Enviar a revision',
  pendiente_gestor: 'Aprobar',
  rechazado: 'Rechazar',
  contratado: 'Aceptar contrato',
  en_ejecucion: 'Iniciar ejecucion',
  pendiente_conciliacion: 'Enviar a conciliacion',
  finalizado: 'Conciliacion aprobada',
  en_correccion: 'Requiere correccion',
}

const TRANSITION_VARIANTS: Partial<Record<ProjectStatus, 'primary' | 'secondary' | 'danger'>> = {
  rechazado: 'danger',
  en_correccion: 'danger',
  pendiente_coordinador: 'primary',
  pendiente_gestor: 'primary',
  contratado: 'primary',
  en_ejecucion: 'primary',
  pendiente_conciliacion: 'primary',
  finalizado: 'primary',
}

export function WorkflowActions({
  projectStatus,
  userRole,
  availableTransitions,
  onTransition,
  transitioning,
}: WorkflowActionsProps) {
  const [showReject, setShowReject] = useState(false)
  const [showConciliation, setShowConciliation] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (userRole === 'administrador' || availableTransitions.length === 0) {
    return (
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Estado:</span>
          <StatusBadge status={projectStatus} />
        </div>
      </div>
    )
  }

  async function handleSimpleTransition(newStatus: ProjectStatus) {
    setError(null)
    const result = await onTransition(newStatus)
    if (!result.success) setError(result.error)
  }

  async function handleReject(comment: string) {
    setError(null)
    const result = await onTransition('rechazado', comment)
    if (!result.success) setError(result.error)
    setShowReject(false)
  }

  async function handleConciliation(approved: boolean, comment: string) {
    setError(null)
    const newStatus: ProjectStatus = approved ? 'finalizado' : 'en_correccion'
    const result = await onTransition(newStatus, comment)
    if (!result.success) setError(result.error)
    setShowConciliation(false)
  }

  // Special case: gestor on pendiente_conciliacion shows ConciliationDialog
  const showConciliationButton =
    userRole === 'gestor' && projectStatus === 'pendiente_conciliacion'

  // Special case: coordinador rejecting shows RejectDialog
  const showRejectButton = availableTransitions.includes('rechazado')

  return (
    <div className="p-4 border-t border-gray-100 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Estado:</span>
        <StatusBadge status={projectStatus} />
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <div className="flex flex-wrap gap-2">
        {availableTransitions
          .filter((s) => {
            // Hide rechazado/en_correccion/finalizado if handled by dialog
            if (showRejectButton && s === 'rechazado') return false
            if (showConciliationButton && (s === 'finalizado' || s === 'en_correccion')) return false
            return true
          })
          .map((status) => (
            <Button
              key={status}
              variant={TRANSITION_VARIANTS[status] ?? 'primary'}
              size="sm"
              disabled={transitioning}
              onClick={() => handleSimpleTransition(status)}
            >
              {transitioning ? <Spinner size="sm" /> : TRANSITION_LABELS[status] ?? status}
            </Button>
          ))}

        {showRejectButton && (
          <Button
            variant="danger"
            size="sm"
            disabled={transitioning}
            onClick={() => setShowReject(true)}
          >
            Rechazar
          </Button>
        )}

        {showConciliationButton && (
          <Button
            variant="secondary"
            size="sm"
            disabled={transitioning}
            onClick={() => setShowConciliation(true)}
          >
            Registrar conciliacion
          </Button>
        )}
      </div>

      <RejectDialog
        open={showReject}
        onClose={() => setShowReject(false)}
        onConfirm={handleReject}
        loading={transitioning}
      />

      <ConciliationDialog
        open={showConciliation}
        onClose={() => setShowConciliation(false)}
        onConfirm={handleConciliation}
        loading={transitioning}
      />
    </div>
  )
}
