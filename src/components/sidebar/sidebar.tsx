'use client'

import { RouteInputForm } from './route-input-form'
import { ResultsPanel } from './results-panel'
import { ExportButton } from './export-button'
import { SegmentSelector } from './segment-selector'
import { BudgetPanel } from './budget-panel'
import { WorkflowActions } from '@/components/project/workflow-actions'
import { CommentsPanel } from '@/components/project/comments-panel'
import { AuditPanel } from '@/components/project/audit-panel'
import { useWorkspace } from '@/components/providers/workspace-provider'

export function Sidebar() {
  const {
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
  } = useWorkspace()

  return (
    <div className="h-full flex flex-col bg-[var(--color-surface)]">
      {/* Workflow Actions */}
      <WorkflowActions
        projectStatus={projectStatus}
        userRole={userRole}
        availableTransitions={availableTransitions}
        onTransition={onTransition}
        transitioning={transitioning}
      />

      <div className="p-4 border-b border-[var(--color-border-light)]">
        <h2 className="font-semibold text-[var(--color-text)]">Calcular postes</h2>
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
        <div className="border-t border-[var(--color-border-light)] pt-4">
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
        <div className="border-t border-[var(--color-border-light)] pt-4">
          <CommentsPanel
            comments={comments}
            loading={commentsLoading}
            onAddComment={onAddComment}
            canComment={canComment}
          />
        </div>

        {/* Audit */}
        {showAudit && (
          <div className="border-t border-[var(--color-border-light)] pt-4">
            <AuditPanel entries={auditEntries} loading={auditLoading} />
          </div>
        )}
      </div>

      {poles.length > 0 && (
        <div className="p-4 border-t border-[var(--color-border-light)] space-y-2">
          <ExportButton poles={poles} segments={segments} />
        </div>
      )}
    </div>
  )
}
