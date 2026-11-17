// Same API module layout as database-setup; implementation for the barcode demo.

// client.ts — The general code: the server address, running fetch, handling errors, and converting the response to JSON.
const API_URL = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '')

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function apiFetch<T>(path: string): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`)
  } catch {
    throw new ApiError(0, 'Could not reach the server')
  }
  if (!response.ok) {
    throw new ApiError(response.status, response.statusText || 'Request failed')
  }
  return await response.json() as T
}
