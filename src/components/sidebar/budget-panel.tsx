'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { BUDGET_UNITS } from '@/lib/constants'
import type { BudgetItem } from '@/types'

interface BudgetPanelProps {
  items: BudgetItem[]
  loading: boolean
  grandTotal: number
  onAdd: (item: { description: string; quantity: number; unit: string; unitCost: number }) => Promise<boolean>
  onDelete: (itemId: string) => Promise<boolean>
  editable: boolean
}

export function BudgetPanel({ items, loading, grandTotal, onAdd, onDelete, editable }: BudgetPanelProps) {
  const [showForm, setShowForm] = useState(false)
  const [description, setDescription] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState('und')
  const [unitCost, setUnitCost] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!description.trim() || !quantity || !unitCost) return
    setSubmitting(true)
    const success = await onAdd({
      description: description.trim(),
      quantity: Number(quantity),
      unit,
      unitCost: Number(unitCost),
    })
    if (success) {
      setDescription('')
      setQuantity('')
      setUnit('und')
      setUnitCost('')
      setShowForm(false)
    }
    setSubmitting(false)
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value)

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <Spinner size="sm" />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-gray-900">Presupuesto</h3>
        {editable && (
          <Button size="sm" variant="ghost" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancelar' : '+ Item'}
          </Button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-2 bg-gray-50 rounded-lg p-3">
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripcion"
            required
          />
          <div className="flex gap-2">
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Cant."
              min="0.01"
              step="0.01"
              required
              className="w-20"
            />
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="h-10 rounded-lg border border-gray-300 bg-white px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {BUDGET_UNITS.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
            <Input
              type="number"
              value={unitCost}
              onChange={(e) => setUnitCost(e.target.value)}
              placeholder="Costo unit."
              min="0"
              step="0.01"
              required
              className="flex-1"
            />
          </div>
          <Button type="submit" size="sm" disabled={submitting} className="w-full">
            {submitting ? <Spinner size="sm" /> : 'Agregar'}
          </Button>
        </form>
      )}

      {items.length === 0 ? (
        <p className="text-sm text-gray-400">Sin items de presupuesto</p>
      ) : (
        <>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm bg-gray-50 rounded px-3 py-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-700 truncate">{item.description}</p>
                  <p className="text-xs text-gray-500">
                    {item.quantity} {item.unit} x {formatCurrency(item.unitCost)}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <span className="text-sm font-medium text-gray-900 whitespace-nowrap">
                    {formatCurrency(item.total)}
                  </span>
                  {editable && (
                    <button
                      onClick={() => onDelete(item.id)}
                      className="text-gray-400 hover:text-red-600 text-xs"
                    >
                      x
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
            <span className="text-sm font-semibold text-gray-700">Total</span>
            <span className="text-base font-bold text-gray-900">{formatCurrency(grandTotal)}</span>
          </div>
        </>
      )}
    </div>
  )
}
