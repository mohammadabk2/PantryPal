import { apiFetch } from './client'

// Mirrors UserRead in backend/app/schemas/user.py
export interface User {
  id: string
  email: string
  display_name: string
  preferred_language: string
  created_at: string
}

// Mirrors Token in backend/app/schemas/user.py
interface TokenResponse {
  access_token: string
  token_type: 'bearer'
  expires_in: number
}

// Mirrors UserCreate in backend/app/schemas/user.py
export interface RegisterData {
  email: string
  password: string
  display_name: string
  preferred_language: 'en' | 'ar' | 'he'
}

export function registerRequest(data: RegisterData) {
  return apiFetch<User>('/auth/register', { method: 'POST', body: data })
}

export function loginRequest(email: string, password: string) {
  return apiFetch<TokenResponse>('/auth/login', {
    method: 'POST',
    body: { email, password },
  })
}

export function getMe() {
  return apiFetch<User>('/auth/me')
}
