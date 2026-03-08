'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { Pole, CalculateRequest, RouteSegment, ProjectStatus, UserRole, BudgetItem, ProjectComment, AuditEntry } from '@/types'

interface WorkspaceContextValue {
  // Route data
  poles: Pole[]
  totalDistanceMeters: number
  selectedPoleIndex: number | null
  onSelectPole: (index: number | null) => void
  onCalculate: (data: CalculateRequest) => void
  isCalculating: boolean
  segments: RouteSegment[]
  onAddSegment: (segment: RouteSegment) => void
  onRemoveSegment: (index: number) => void
  onPoleDrag?: (index: number, lat: number, lng: number) => void
  // Workflow
  projectStatus: ProjectStatus
  userRole: UserRole
  availableTransitions: ProjectStatus[]
  onTransition: (newStatus: ProjectStatus, comment?: string) => Promise<{ success: boolean; error: string | null }>
  transitioning: boolean
  // Budget
  budgetItems: BudgetItem[]
  budgetLoading: boolean
  budgetGrandTotal: number
  onAddBudgetItem: (item: { description: string; quantity: number; unit: string; unitCost: number }) => Promise<boolean>
  onDeleteBudgetItem: (itemId: string) => Promise<boolean>
  budgetEditable: boolean
  // Comments
  comments: ProjectComment[]
  commentsLoading: boolean
  onAddComment: (content: string) => Promise<boolean>
  canComment: boolean
  // Audit
  auditEntries: AuditEntry[]
  auditLoading: boolean
  showAudit: boolean
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)

export function WorkspaceProvider({
  children,
  value,
}: {
  children: ReactNode
  value: WorkspaceContextValue
}) {
  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext)
  if (!ctx) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider')
  }
  return ctx
}
