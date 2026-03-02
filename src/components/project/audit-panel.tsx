'use client'

import { Spinner } from '@/components/ui/spinner'
import { PROJECT_STATUS_CONFIG } from '@/lib/constants'
import type { AuditEntry, ProjectStatus } from '@/types'

interface AuditPanelProps {
  entries: AuditEntry[]
  loading: boolean
}

const ACTION_LABELS: Record<string, string> = {
  status_change: 'Cambio de estado',
  budget_item_added: 'Item de presupuesto agregado',
  budget_item_updated: 'Item de presupuesto actualizado',
  budget_item_deleted: 'Item de presupuesto eliminado',
  comment_added: 'Comentario agregado',
}

export function AuditPanel({ entries, loading }: AuditPanelProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <Spinner size="sm" />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm text-gray-900">Historial de auditoria</h3>

      {entries.length === 0 ? (
        <p className="text-sm text-gray-400">Sin registros</p>
      ) : (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {entries.map((entry) => {
            const details = entry.details as Record<string, unknown>
            return (
              <div key={entry.id} className="border-l-2 border-gray-200 pl-3 py-1 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">
                    {ACTION_LABELS[entry.action] ?? entry.action}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {entry.userEmail ?? 'Usuario'} — {new Date(entry.createdAt).toLocaleString('es-CO')}
                </p>
                {entry.action === 'status_change' && typeof details.from === 'string' && typeof details.to === 'string' && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {PROJECT_STATUS_CONFIG[details.from as ProjectStatus]?.label ?? details.from}
                    {' → '}
                    {PROJECT_STATUS_CONFIG[details.to as ProjectStatus]?.label ?? details.to}
                  </p>
                )}
                {typeof details.comment === 'string' && (
                  <p className="text-xs text-gray-600 mt-0.5 italic">
                    &quot;{details.comment}&quot;
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
