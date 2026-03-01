'use client'

import { Button } from '@/components/ui/button'
import { exportPolesToCSV } from '@/lib/export/csv'
import type { Pole, RouteSegment } from '@/types'

interface ExportButtonProps {
  poles: Pole[]
  segments?: RouteSegment[]
  disabled?: boolean
}

export function ExportButton({ poles, segments = [], disabled }: ExportButtonProps) {
  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={() => exportPolesToCSV(poles, segments)}
      disabled={disabled || poles.length === 0}
      className="w-full"
    >
      Exportar CSV
    </Button>
  )
}
