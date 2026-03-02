'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/status-badge'
import type { Project, Zone } from '@/types'

interface ProjectCardProps {
  project: Project
  onDelete: (id: string) => void
  zones?: Zone[]
}

export function ProjectCard({ project, onDelete, zones }: ProjectCardProps) {
  const date = new Date(project.updatedAt).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  const zoneName = zones?.find((z) => z.id === project.zoneId)?.name

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Link
                href={`/project/${project.id}`}
                className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
              >
                {project.name}
              </Link>
              <StatusBadge status={project.status} />
            </div>
            {project.description && (
              <p className="text-sm text-gray-500 mt-1 truncate">{project.description}</p>
            )}
            <div className="flex items-center gap-3 mt-2">
              <p className="text-xs text-gray-400">{date}</p>
              {zoneName && (
                <p className="text-xs text-gray-400">Zona: {zoneName}</p>
              )}
            </div>
          </div>
          {project.status === 'borrador' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(project.id)}
              className="text-gray-400 hover:text-red-600 ml-2"
            >
              Eliminar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
