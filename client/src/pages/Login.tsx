import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { ApiError } from '../api/client'
import { useAuth } from '../auth/useAuth'

// Translation key for each way a login can fail.
function errorKey(err: unknown) {
  if (err instanceof ApiError) {
    // 422: the server rejected the email format, so it can't match an account either.
    if (err.status === 401 || err.status === 422) return 'login.errors.invalidCredentials' as const
    if (err.status === 403) return 'login.errors.accountDisabled' as const
    if (err.status === 0 || err.status >= 500) return 'login.errors.serverUnreachable' as const
  }
  return 'login.errors.generic' as const
}

function Login() {
  const { t } = useTranslation()
  const { login, status } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<ReturnType<typeof errorKey> | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Already logged in: nothing to do here.
  if (status === 'authenticated') return <Navigate to="/" replace />

  async function submit() {
    setError(null)
    setSubmitting(true)
    try {
      await login(email.trim(), password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(errorKey(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <LanguageSwitcher />
      <section id="center">
        <h1 className="title">{t('login.title')}</h1>

        <form
          className="form"
          onSubmit={(e) => {
            e.preventDefault()
            void submit()
          }}
        >
          <label className="field">
            {t('login.emailLabel')}
            <input
              className="input"
              type="email"
              dir="ltr"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="field">
            {t('login.passwordLabel')}
            <input
              className="input"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {error && (
            <p className="form-error" role="alert">
              {t(error)}
            </p>
          )}

          <button type="submit" className="btn" disabled={submitting}>
            {submitting ? t('login.submitting') : t('login.submit')}
          </button>
        </form>

        <p>
          {t('home.noAccount')} <Link to="/signup">{t('home.signUp')}</Link>
        </p>

        <Link to="/">{t('login.backHome')}</Link>
      </section>
    </>
  )
}

export default Login