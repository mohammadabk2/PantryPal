import { apiFetch } from './client'

export interface PantryItem {
  id: string
  user_id: string
  name: string
  quantity: string
  unit: string
  expiration_date: string | null
  barcode: string | null
}

export interface PantryItemInput {
  name: string
  quantity: string
  unit: string
  expiration_date: string | null
  barcode: string | null
}

export type PantryItemPatch = Partial<PantryItemInput>

export function getPantryItems() {
  return apiFetch<PantryItem[]>('/me/pantry-items')
}

export function addPantryItem(item: PantryItemInput) {
  return apiFetch<PantryItem>('/me/pantry-items', { method: 'POST', body: item })
}

export function updatePantryItem(id: string, changes: PantryItemPatch) {
  return apiFetch<PantryItem>(`/me/pantry-items/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: changes,
  })
}

export function deletePantryItem(id: string) {
  return apiFetch<void>(`/me/pantry-items/${encodeURIComponent(id)}`, { method: 'DELETE' })
}
