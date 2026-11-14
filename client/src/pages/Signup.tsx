import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { ApiError } from '../api/client'
import type { RegisterData } from '../api/auth'
import { useAuth } from '../auth/useAuth'
import './Signup.css'

// Must match the limits in backend/app/schemas/user.py (UserCreate).
const PASSWORD_MIN = 8
const PASSWORD_MAX = 128
const NAME_MAX = 100

// The questions, in order. Add a step here, then handle it in validate(), question() and the input switch.
const STEPS = ['name', 'email', 'password'] as const
type Step = (typeof STEPS)[number]

// How long the old question takes to slide out. Must match the leave animation in Signup.css.
const LEAVE_MS = 180

type Values = Record<Step, string>
type Direction = 'forward' | 'back'

type ErrorKey =
  | 'signup.errors.nameRequired'
  | 'signup.errors.emailInvalid'
  | 'signup.errors.passwordTooShort'
  | 'signup.errors.emailTaken'
  | 'signup.errors.invalidInput'
  | 'signup.errors.serverUnreachable'
  | 'signup.errors.generic'

// Loose check; the server does the real validation.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(step: Step, values: Values): ErrorKey | null {
  switch (step) {
    case 'name':
      return values.name.trim() ? null : 'signup.errors.nameRequired'
    case 'email':
      return EMAIL_PATTERN.test(values.email.trim()) ? null : 'signup.errors.emailInvalid'
    case 'password':
      return values.password.length >= PASSWORD_MIN ? null : 'signup.errors.passwordTooShort'
  }
}

// Translation key for each way creating the account can fail.
function serverErrorKey(err: unknown): ErrorKey {
  if (err instanceof ApiError) {
    if (err.status === 409) return 'signup.errors.emailTaken'
    if (err.status === 422) return 'signup.errors.invalidInput'
    if (err.status === 0 || err.status >= 500) return 'signup.errors.serverUnreachable'
  }
  return 'signup.errors.generic'
}

function Signup() {
  const { t, i18n } = useTranslation()
  const { register, status } = useAuth()
  const navigate = useNavigate()

  const [values, setValues] = useState<Values>({ name: '', email: '', password: '' })
  const [stepIndex, setStepIndex] = useState(0)
  const [direction, setDirection] = useState<Direction>('forward')
  const [leaving, setLeaving] = useState(false)
  const [error, setError] = useState<ErrorKey | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const leaveTimer = useRef<number | undefined>(undefined)

  // Don't switch steps after the page has been left.
  useEffect(() => () => window.clearTimeout(leaveTimer.current), [])

  // Already logged in: nothing to do here.
  if (status === 'authenticated') return <Navigate to="/" replace />

  const step = STEPS[stepIndex]
  const isLastStep = stepIndex === STEPS.length - 1
  const busy = leaving || submitting

  // Slide the current question out, then show question `next` (optionally with an error on it).
  function goTo(next: number, dir: Direction, errorOnArrival: ErrorKey | null = null) {
    setDirection(dir)
    setLeaving(true)
    setError(null)
    window.clearTimeout(leaveTimer.current)
    leaveTimer.current = window.setTimeout(() => {
      setStepIndex(next)
      setLeaving(false)
      setError(errorOnArrival)
    }, LEAVE_MS)
  }

  async function createAccount() {
    setSubmitting(true)
    try {
      await register({
        email: values.email.trim(),
        password: values.password,
        display_name: values.name.trim(),
        // Save the language the user is viewing the site in.
        preferred_language: (i18n.resolvedLanguage ?? 'en') as RegisterData['preferred_language'],
      })
      navigate('/', { replace: true })
    } catch (err) {
      const key = serverErrorKey(err)
      // The server only says the email is taken at the very end, so go back to that question.
      if (key === 'signup.errors.emailTaken') goTo(STEPS.indexOf('email'), 'back', key)
      else setError(key)
    } finally {
      setSubmitting(false)
    }
  }

  function handleSubmit() {
    if (busy) return
    const problem = validate(step, values)
    if (problem) {
      setError(problem)
      return
    }
    if (isLastStep) void createAccount()
    else goTo(stepIndex + 1, 'forward')
  }

  const update = (field: Step) => (e: ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, [field]: e.target.value }))
    setError(null)
  }

  function question(): string {
    switch (step) {
      case 'name':
        return t('signup.steps.name.question')
      case 'email':
        return t('signup.steps.email.question', { name: values.name.trim() })
      case 'password':
        return t('signup.steps.password.question')
    }
  }

  const inputId = `signup-${step}`
  // Props every step's input shares. autoFocus works because each step mounts fresh (see key below).
  const common = {
    id: inputId,
    className: 'input input-lg',
    autoFocus: true,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? 'signup-error' : undefined,
  }
  const passwordLongEnough = values.password.length >= PASSWORD_MIN

  return (
    <>
      <LanguageSwitcher />
      <section id="center">
        <form
          className="signup-wizard"
          noValidate // we validate each step ourselves, with translated messages
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit()
          }}
        >
          <h1 className="visually-hidden">{t('signup.title')}</h1>

          <div className="signup-progress">
            <span>{t('signup.stepOf', { current: stepIndex + 1, total: STEPS.length })}</span>
            <div
              className="progress-track"
              role="progressbar"
              aria-label={t('signup.title')}
              aria-valuemin={1}
              aria-valuemax={STEPS.length}
              aria-valuenow={stepIndex + 1}
            >
              <div
                className="progress-fill"
                style={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* key={step} remounts this block for each question, which replays the enter animation. */}
          <div
            key={step}
            className={`signup-step ${leaving ? `leave-${direction}` : `enter-${direction}`}`}
          >
            <label htmlFor={inputId} className="step-question">
              {question()}
            </label>

            {step === 'name' && (
              <input
                {...common}
                type="text"
                autoComplete="name"
                maxLength={NAME_MAX}
                value={values.name}
                onChange={update('name')}
              />
            )}

            {step === 'email' && (
              <input
                {...common}
                type="email"
                dir="ltr"
                autoComplete="email"
                value={values.email}
                onChange={update('email')}
              />
            )}

            {step === 'password' && (
              <>
                {/* Lets password managers save the email together with the password. */}
                <input
                  type="email"
                  autoComplete="username"
                  value={values.email}
                  readOnly
                  tabIndex={-1}
                  aria-hidden="true"
                  className="visually-hidden"
                />
                <div className="password-field">
                  <input
                    {...common}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    maxLength={PASSWORD_MAX}
                    value={values.password}
                    onChange={update('password')}
                  />
                  <button
                    type="button"
                    className="toggle-visibility"
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((s) => !s)}
                  >
                    {showPassword ? t('signup.hidePassword') : t('signup.showPassword')}
                  </button>
                </div>
                <p className={`field-hint${passwordLongEnough ? ' met' : ''}`}>
                  {passwordLongEnough && '✓ '}
                  {t('signup.steps.password.hint')}
                </p>
              </>
            )}

            {error && (
              <p id="signup-error" className="form-error" role="alert">
                {t(error)}
              </p>
            )}
          </div>

          <div className="signup-actions">
            {stepIndex > 0 && (
              <button
                type="button"
                className="btn btn-secondary"
                disabled={busy}
                onClick={() => goTo(stepIndex - 1, 'back')}
              >
                {t('signup.back')}
              </button>
            )}
            <button type="submit" className="btn" disabled={busy}>
              {!isLastStep
                ? t('signup.next')
                : submitting
                  ? t('signup.submitting')
                  : t('signup.submit')}
            </button>
          </div>
        </form>

        <p>
          {t('signup.haveAccount')} <Link to="/login">{t('home.login')}</Link>
        </p>

        <Link to="/">{t('signup.backHome')}</Link>
      </section>
    </>
  )
}

export default Signup
