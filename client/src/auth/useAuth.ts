import { useContext } from 'react'
import { AuthContext } from './context'

/** The logged-in user and login/logout. Must be used inside <AuthProvider>. */
export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside <AuthProvider>')
  return value
}
