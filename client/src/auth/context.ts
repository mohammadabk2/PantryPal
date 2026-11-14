import { createContext } from 'react'
import type { RegisterData, User } from '../api/auth'

// loading: we have a saved token and are checking it with the server.
export type AuthStatus = 'loading' | 'authenticated' | 'anonymous'

export interface AuthContextValue {
  user: User | null
  status: AuthStatus
  /** Throws ApiError if the login fails. */
  login: (email: string, password: string) => Promise<void>
  /** Creates the account, then logs in. Throws ApiError if either step fails. */
  register: (data: RegisterData) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
