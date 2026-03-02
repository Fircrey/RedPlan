'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { StatusBadge } from '@/components/ui/status-badge'
import type { Project, Zone } from '@/types'

interface ProjectCardProps {
  project: Project
  onDelete: (id: string) => void
  zones?: Zone[]
}

export function ProjectCard({ project, onDelete, zones }: ProjectCardProps) {
  const [showConfirm, setShowConfirm] = useState(false)

  const date = new Date(project.updatedAt).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  const zoneName = zones?.find((z) => z.id === project.zoneId)?.name

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Link
                  href={`/project/${project.id}`}
                  className="text-lg font-semibold text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors"
                >
                  {project.name}
                </Link>
                <StatusBadge status={project.status} />
              </div>
              {project.description && (
                <p className="text-sm text-[var(--color-text-muted)] mt-1 truncate">{project.description}</p>
              )}
              <div className="flex items-center gap-3 mt-2">
                <p className="text-xs text-[var(--color-text-muted)]">{date}</p>
                {zoneName && (
                  <p className="text-xs text-[var(--color-text-muted)]">Zona: {zoneName}</p>
                )}
              </div>
            </div>
            {project.status === 'borrador' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowConfirm(true)}
                className="text-[var(--color-text-muted)] hover:text-red-600 ml-2"
              >
                Eliminar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showConfirm} onClose={() => setShowConfirm(false)}>
        <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">Eliminar proyecto</h2>
        <p className="text-sm text-[var(--color-text-secondary)] mb-4">
          Estas seguro de eliminar &quot;{project.name}&quot;? Esta accion no se puede deshacer.
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowConfirm(false)} className="flex-1">
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={() => { onDelete(project.id); setShowConfirm(false) }}
            className="flex-1"
          >
            Eliminar
          </Button>
        </div>
      </Dialog>
    </>
  )
}
