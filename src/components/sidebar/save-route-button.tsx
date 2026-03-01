'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog } from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import { useToast } from '@/components/ui/toast'
import type { Pole, RouteMode, LatLng } from '@/types'

interface SaveRouteButtonProps {
  projectId: string
  poles: Pole[]
  originLat: number
  originLng: number
  destLat: number
  destLng: number
  spacingMeters: number
  mode: RouteMode
  polylinePoints: LatLng[]
  totalDistanceMeters: number
  disabled?: boolean
}

export function SaveRouteButton({
  projectId,
  poles,
  originLat,
  originLng,
  destLat,
  destLng,
  spacingMeters,
  mode,
  totalDistanceMeters,
  disabled,
}: SaveRouteButtonProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)

    try {
      const res = await fetch('/api/routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          name: name.trim(),
          originLat,
          originLng,
          destLat,
          destLng,
          spacingMeters,
          mode,
          totalDistanceMeters,
          totalPoles: poles.length,
          poles,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al guardar')
      }

      toast('Ruta guardada correctamente', 'success')
      setOpen(false)
      setName('')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Error al guardar', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Button
        variant="primary"
        size="sm"
        onClick={() => setOpen(true)}
        disabled={disabled || poles.length === 0}
        className="w-full"
      >
        Guardar ruta
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <h2 className="text-lg font-semibold mb-4">Guardar ruta</h2>
        <Input
          placeholder="Nombre de la ruta"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
        <div className="flex gap-2 mt-4">
          <Button variant="secondary" onClick={() => setOpen(false)} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || saving} className="flex-1">
            {saving ? <Spinner size="sm" /> : 'Guardar'}
          </Button>
        </div>
      </Dialog>
    </>
  )
}
