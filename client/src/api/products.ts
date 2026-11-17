import { apiFetch } from './barcodeclient'

export interface Product {
  id: number
  barcode: string
  name: string
}

export function getProductByBarcode(barcode: string) {
  return apiFetch<Product>(`/products/${encodeURIComponent(barcode)}`)
}
