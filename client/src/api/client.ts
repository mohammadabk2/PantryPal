// Base URL for the backend, from client/.env (checked at startup in vite.config.ts).
const API_URL = import.meta.env.VITE_API_URL

const TOKEN_KEY = 'pantrypal.token'

// localStorage can throw (private mode, blocked storage), so every access is wrapped.
export const tokenStorage = {
  get(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY)
    } catch {
      return null
    }
  },
  set(token: string) {
    try {
      localStorage.setItem(TOKEN_KEY, token)
    } catch {
      // Ignore: the user stays logged in until the page reloads.
    }
  },
  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY)
    } catch {
      // Ignore.
    }
  },
}

/** Thrown for any failed request. status is 0 when the server couldn't be reached. */
export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/** fetch() for our API: sends JSON, adds the login token, throws ApiError on failure. */
export async function apiFetch<T>(
  path: string,
  options: { method?: string; body?: unknown } = {},
): Promise<T> {
  const headers: Record<string, string> = {}
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'
  const token = tokenStorage.get()
  if (token) headers.Authorization = `Bearer ${token}`

  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    })
  } catch {
    throw new ApiError(0, 'Could not reach the server')
  }

  if (!res.ok) {
    let message = res.statusText
    try {
      const data = await res.json()
      if (typeof data?.detail === 'string') message = data.detail
    } catch {
      // Body wasn't JSON; keep statusText.
    }
    throw new ApiError(res.status, message)
  }

  return (await res.json()) as T
}
