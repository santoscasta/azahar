import { useId, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signIn, signUp, type AuthResult } from '../lib/supabase.js'
import { useTranslations } from '../App.js'

interface AuthClient {
  signIn: (email: string, password: string) => Promise<AuthResult>
  signUp: (email: string, password: string) => Promise<AuthResult>
}

interface LoginPageProps {
  authClient?: AuthClient
  navigateTo?: (path: string) => void
}

export default function LoginPage({ authClient = { signIn, signUp }, navigateTo }: LoginPageProps = {}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = navigateTo ?? useNavigate()
  const emailInputId = useId()
  const passwordInputId = useId()
  const { t } = useTranslations()

  const emailPattern = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/, [])
  const isEmailValid = emailPattern.test(email.trim())
  const isPasswordValid = password.length >= 8
  const canSubmit = isEmailValid && isPasswordValid && !loading

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedEmail = email.trim()
    if (!isEmailValid || !isPasswordValid) {
      setError(t('auth.error.inputInvalid'))
      return
    }
    setError('')
    setLoading(true)

    try {
      let result
      if (isSignUp) {
        result = await authClient.signUp(trimmedEmail, password)
      } else {
        result = await authClient.signIn(trimmedEmail, password)
      }

      if (result.success) {
        navigate('/app')
      } else {
        setError(result.error || t('auth.error.unknown'))
      }
    } catch (err) {
      setError(t('auth.error.unknown'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: 'var(--color-bg)',
      }}
    >
      <div className="w-full max-w-xl">
        <div className="rounded-2xl bg-[var(--color-surface)] shadow-[var(--shadow-md)] border border-[var(--color-border)] px-10 py-12 space-y-10">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="flex items-center justify-center">
              <img src="/icon.png" alt="Azahar" className="h-32 w-32 object-contain" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-[var(--color-text-muted)]">Azahar</p>
              <p className="text-[26px] font-bold text-[var(--on-surface)]">{isSignUp ? t('auth.title.signup') : t('auth.title.login')}</p>
              <p className="text-sm text-[var(--color-text-muted)]">{t('auth.tagline')}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-[var(--on-surface)]" htmlFor={emailInputId}>{t('auth.email.label')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                id={emailInputId}
                className={`w-full min-h-[44px] px-4 py-3 rounded-2xl border bg-[var(--color-surface-elevated)] text-[var(--on-surface)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-200)] focus:border-[var(--color-primary-600)] ${
                  email && !isEmailValid
                    ? 'border-[var(--color-danger-500)] focus:ring-[var(--color-danger-500)] focus:border-[var(--color-danger-500)]'
                    : 'border-[var(--color-border)]'
                }`}
                placeholder={t('auth.email.placeholder')}
                aria-invalid={email ? !isEmailValid : undefined}
                aria-describedby={email ? `${emailInputId}-hint` : undefined}
              />
              <p id={`${emailInputId}-hint`} className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                {!email && t('auth.email.hint')}
                {email && !isEmailValid && <span className="text-[var(--color-danger-500)]">{t('auth.email.error')}</span>}
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-[var(--on-surface)]" htmlFor={passwordInputId}>
                {t('auth.password.label')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  id={passwordInputId}
                  className={`w-full min-h-[44px] pl-4 pr-20 py-3 rounded-2xl border bg-[var(--color-surface-elevated)] text-[var(--on-surface)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-200)] focus:border-[var(--color-primary-600)] ${
                    password && !isPasswordValid
                      ? 'border-[var(--color-danger-500)] focus:ring-[var(--color-danger-500)] focus:border-[var(--color-danger-500)]'
                      : 'border-[var(--color-border)]'
                  }`}
                  placeholder={t('auth.password.placeholder')}
                  aria-invalid={password ? !isPasswordValid : undefined}
                  aria-describedby={`${passwordInputId}-hint`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute inset-y-0 right-2 min-w-[44px] px-3 text-xs font-semibold text-[var(--color-primary-700)] hover:text-[var(--color-primary-600)] flex items-center justify-center"
                  aria-pressed={showPassword}
                  aria-label={showPassword ? t('auth.password.toggle.hide') : t('auth.password.toggle.show')}
                >
                  {showPassword ? t('auth.password.toggle.hide') : t('auth.password.toggle.show')}
                </button>
              </div>
              <p id={`${passwordInputId}-hint`} className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                <span>{t('auth.password.hint')}</span>
                {password && !isPasswordValid && <span className="text-[var(--color-danger-500)]">{t('auth.password.error')}</span>}
              </p>
              <div className="text-right">
                <a
                  href="mailto:soporte@azahar.app"
                  className="text-xs text-[var(--color-primary-700)] font-semibold hover:text-[var(--color-primary-600)]"
                >
                  {t('auth.forgot')}
                </a>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-[rgba(214,69,69,0.12)] border border-[rgba(214,69,69,0.35)] rounded-2xl text-[var(--color-danger-500)] text-sm" role="alert" aria-live="assertive">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full py-3 rounded-xl bg-[var(--color-primary-600)] text-[var(--on-primary)] font-semibold shadow-[0_18px_30px_rgba(45,37,32,0.15)] hover:bg-[var(--color-primary-700)] transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 border-2 border-[var(--on-primary)] border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                  <span>{t('auth.cta.loading')}</span>
                </span>
              ) : isSignUp ? (
                t('auth.cta.signup')
              ) : (
                t('auth.cta.login')
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-[var(--color-text-muted)] flex items-center justify-center gap-2">
            <span>{isSignUp ? t('auth.switch.toLoginQuestion') : t('auth.switch.toSignupQuestion')}</span>
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-[var(--color-primary-700)] font-semibold hover:text-[var(--color-primary-600)]"
            >
              {isSignUp ? t('auth.switch.toLogin') : t('auth.switch.toSignup')}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
