import { apiFetch } from './barcodeclient'

const OPEN_FOOD_FACTS_API = 'https://world.openfoodfacts.org/api/v2/product'

export interface Product {
  id?: number
  barcode: string
  name: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

async function getProductFromOpenFoodFacts(barcode: string): Promise<Product> {
  const url = `${OPEN_FOOD_FACTS_API}/${encodeURIComponent(barcode)}.json?fields=product_name,product_name_en`
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(8000),
  })

  if (!response.ok) {
    throw new Error(`Open Food Facts returned HTTP ${response.status}`)
  }

  const data: unknown = await response.json()
  if (!isRecord(data) || data.status !== 1 || !isRecord(data.product)) {
    throw new Error('Open Food Facts did not find this product')
  }

  const name = [data.product.product_name, data.product.product_name_en]
    .find((value): value is string => typeof value === 'string' && value.trim().length > 0)
    ?.trim()

  if (!name) {
    throw new Error('Open Food Facts returned no product name')
  }

  return { barcode, name }
}

export async function getProductByBarcode(barcode: string): Promise<Product> {
  try {
    return await getProductFromOpenFoodFacts(barcode)
  } catch {
    return apiFetch<Product>(`/products/${encodeURIComponent(barcode)}`)
  }
}
