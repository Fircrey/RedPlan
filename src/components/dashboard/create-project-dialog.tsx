'use client'

import { useState } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import type { Zone } from '@/types'

interface CreateProjectDialogProps {
  open: boolean
  onClose: () => void
  onCreate: (name: string, description?: string, zoneId?: string) => Promise<unknown>
  zones: Zone[]
}

export function CreateProjectDialog({ open, onClose, onCreate, zones }: CreateProjectDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [zoneId, setZoneId] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    await onCreate(name.trim(), description.trim() || undefined, zoneId || undefined)
    setLoading(false)
    setName('')
    setDescription('')
    setZoneId('')
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <h2 className="text-lg font-semibold mb-4">Nuevo proyecto</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Mi proyecto"
            required
            autoFocus
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripcion (opcional)
          </label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripcion del proyecto"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Zona</label>
          <select
            value={zoneId}
            onChange={(e) => setZoneId(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Sin zona</option>
            {zones.map((zone) => (
              <option key={zone.id} value={zone.id}>{zone.name}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" disabled={!name.trim() || loading} className="flex-1">
            {loading ? <Spinner size="sm" /> : 'Crear'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
