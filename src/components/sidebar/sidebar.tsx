'use client'

import { RouteInputForm } from './route-input-form'
import { ResultsPanel } from './results-panel'
import { ExportButton } from './export-button'
import { SegmentSelector } from './segment-selector'
import { BudgetPanel } from './budget-panel'
import { WorkflowActions } from '@/components/project/workflow-actions'
import { CommentsPanel } from '@/components/project/comments-panel'
import { AuditPanel } from '@/components/project/audit-panel'
import type { Pole, CalculateRequest, RouteSegment, ProjectStatus, UserRole, BudgetItem, ProjectComment, AuditEntry } from '@/types'

interface SidebarProps {
  poles: Pole[]
  totalDistanceMeters: number
  selectedPoleIndex: number | null
  onSelectPole: (index: number | null) => void
  onCalculate: (data: CalculateRequest) => void
  isCalculating: boolean
  segments: RouteSegment[]
  onAddSegment: (segment: RouteSegment) => void
  onRemoveSegment: (index: number) => void
  // Workflow props
  projectStatus: ProjectStatus
  userRole: UserRole
  availableTransitions: ProjectStatus[]
  onTransition: (newStatus: ProjectStatus, comment?: string) => Promise<{ success: boolean; error: string | null }>
  transitioning: boolean
  // Budget props
  budgetItems: BudgetItem[]
  budgetLoading: boolean
  budgetGrandTotal: number
  onAddBudgetItem: (item: { description: string; quantity: number; unit: string; unitCost: number }) => Promise<boolean>
  onDeleteBudgetItem: (itemId: string) => Promise<boolean>
  budgetEditable: boolean
  // Comments props
  comments: ProjectComment[]
  commentsLoading: boolean
  onAddComment: (content: string) => Promise<boolean>
  canComment: boolean
  // Audit props
  auditEntries: AuditEntry[]
  auditLoading: boolean
  showAudit: boolean
}

export function Sidebar({
  poles,
  totalDistanceMeters,
  selectedPoleIndex,
  onSelectPole,
  onCalculate,
  isCalculating,
  segments,
  onAddSegment,
  onRemoveSegment,
  projectStatus,
  userRole,
  availableTransitions,
  onTransition,
  transitioning,
  budgetItems,
  budgetLoading,
  budgetGrandTotal,
  onAddBudgetItem,
  onDeleteBudgetItem,
  budgetEditable,
  comments,
  commentsLoading,
  onAddComment,
  canComment,
  auditEntries,
  auditLoading,
  showAudit,
}: SidebarProps) {
  return (
    <div className="h-full flex flex-col bg-white">
      {/* Workflow Actions */}
      <WorkflowActions
        projectStatus={projectStatus}
        userRole={userRole}
        availableTransitions={availableTransitions}
        onTransition={onTransition}
        transitioning={transitioning}
      />

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

        {/* Budget */}
        <div className="border-t border-gray-100 pt-4">
          <BudgetPanel
            items={budgetItems}
            loading={budgetLoading}
            grandTotal={budgetGrandTotal}
            onAdd={onAddBudgetItem}
            onDelete={onDeleteBudgetItem}
            editable={budgetEditable}
          />
        </div>

        {/* Comments */}
        <div className="border-t border-gray-100 pt-4">
          <CommentsPanel
            comments={comments}
            loading={commentsLoading}
            onAddComment={onAddComment}
            canComment={canComment}
          />
        </div>

        {/* Audit */}
        {showAudit && (
          <div className="border-t border-gray-100 pt-4">
            <AuditPanel entries={auditEntries} loading={auditLoading} />
          </div>
        )}
      </div>

      {poles.length > 0 && (
        <div className="p-4 border-t border-gray-100 space-y-2">
          <ExportButton poles={poles} segments={segments} />
        </div>
      )}
    </div>
  )
}
