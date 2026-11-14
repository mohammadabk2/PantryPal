import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { ApiError, tokenStorage } from '../api/client'
import { getMe, loginRequest, type User } from '../api/auth'
import { AuthContext, type AuthStatus } from './context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthStatus>(() =>
    tokenStorage.get() ? 'loading' : 'anonymous',
  )

  // On page load, check a saved token is still valid and fetch the user it belongs to.
  useEffect(() => {
    if (!tokenStorage.get()) return
    let cancelled = false
    getMe()
      .then((me) => {
        if (cancelled) return
        setUser(me)
        setStatus('authenticated')
      })
      .catch((err) => {
        if (cancelled) return
        // Expired or invalid token: forget it. On other errors (server down) keep it for next time.
        if (err instanceof ApiError && err.status === 401) tokenStorage.clear()
        setStatus('anonymous')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { access_token } = await loginRequest(email, password)
    tokenStorage.set(access_token)
    try {
      const me = await getMe()
      setUser(me)
      setStatus('authenticated')
    } catch (err) {
      tokenStorage.clear()
      throw err
    }
  }, [])

  const logout = useCallback(() => {
    tokenStorage.clear()
    setUser(null)
    setStatus('anonymous')
  }, [])

  const value = useMemo(() => ({ user, status, login, logout }), [user, status, login, logout])

  return <AuthContext value={value}>{children}</AuthContext>
}
