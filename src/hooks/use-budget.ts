'use client'

import { useCallback, useEffect, useState } from 'react'
import type { BudgetItem } from '@/types'

export function useBudget(projectId: string) {
  const [items, setItems] = useState<BudgetItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/budget`)
      if (!res.ok) throw new Error('Error al cargar presupuesto')
      const json = await res.json()
      const data = json.data?.items ?? json.data ?? json
      const list = (Array.isArray(data) ? data : []) as Record<string, unknown>[]
      setItems(
        list.map((i): BudgetItem => ({
          id: i.id as string,
          projectId: i.project_id as string,
          description: i.description as string,
          quantity: Number(i.quantity),
          unit: i.unit as string,
          unitCost: Number(i.unit_cost),
          total: Number(i.total),
        })),
      )
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  async function addItem(item: { description: string; quantity: number; unit: string; unitCost: number }) {
    const res = await fetch(`/api/projects/${projectId}/budget`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unit_cost: item.unitCost,
      }),
    })
    if (!res.ok) return false
    await fetchItems()
    return true
  }

  async function updateItem(itemId: string, item: { description: string; quantity: number; unit: string; unitCost: number }) {
    const res = await fetch(`/api/projects/${projectId}/budget/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unit_cost: item.unitCost,
      }),
    })
    if (!res.ok) return false
    await fetchItems()
    return true
  }

  async function deleteItem(itemId: string) {
    const res = await fetch(`/api/projects/${projectId}/budget/${itemId}`, {
      method: 'DELETE',
    })
    if (!res.ok) return false
    setItems((prev) => prev.filter((i) => i.id !== itemId))
    return true
  }

  const grandTotal = items.reduce((sum, i) => sum + i.total, 0)

  return { items, loading, grandTotal, addItem, updateItem, deleteItem, refetch: fetchItems }
}
