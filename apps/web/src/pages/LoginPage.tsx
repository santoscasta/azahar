import { useId, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signIn, signUp, type AuthResult } from '../lib/supabase.js'

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
  const navigate = navigateTo ?? useNavigate()
  const emailInputId = useId()
  const passwordInputId = useId()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      let result
      if (isSignUp) {
        result = await authClient.signUp(email, password)
      } else {
        result = await authClient.signIn(email, password)
      }

      if (result.success) {
        navigate('/app')
      } else {
        setError(result.error || 'Error desconocido')
      }
    } catch (err) {
      setError('Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: 'radial-gradient(circle at 20% 20%, rgba(255, 157, 102, 0.2), transparent 35%), radial-gradient(circle at 80% 10%, rgba(143, 170, 143, 0.22), transparent 30%), var(--color-bg)',
      }}
    >
      <div className="w-full max-w-xl">
        <div className="rounded-[32px] bg-white shadow-[0_20px_50px_rgba(45,37,32,0.08)] border border-[var(--color-border)] px-10 py-12 space-y-10">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="flex items-center justify-center">
              <img src="/icon.png" alt="Azahar" className="h-32 w-32 object-contain" />
            </div>
            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-[0.35em] text-[#736B63]">Azahar</p>
              <p className="text-3xl font-bold text-[#2D2520]">{isSignUp ? 'Crea tu cuenta' : 'Inicia sesión'}</p>
              <p className="text-sm text-[#736B63]">Organiza tus tareas con calma y sin distracciones.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-[#2D2520]" htmlFor={emailInputId}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                id={emailInputId}
                className="w-full px-4 py-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-primary-100)] text-[#2D2520] placeholder-[#C4BDB5] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-600)] focus:border-[var(--color-primary-600)]"
                placeholder="tu@ejemplo.com"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-[#2D2520]" htmlFor={passwordInputId}>
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                id={passwordInputId}
                className="w-full px-4 py-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-primary-100)] text-[#2D2520] placeholder-[#C4BDB5] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-600)] focus:border-[var(--color-primary-600)]"
                placeholder="••••••••"
              />
              <div className="text-right">
                <a
                  href="mailto:soporte@azahar.app"
                  className="text-xs text-[var(--color-primary-700)] font-semibold hover:text-[var(--color-primary-600)]"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-[var(--color-primary-600)] text-white font-semibold shadow-[0_18px_30px_rgba(45,37,32,0.15)] hover:bg-[var(--color-primary-700)] transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Cargando...' : isSignUp ? 'Registrarse' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-[#736B63] flex items-center justify-center gap-2">
            <span>{isSignUp ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}</span>
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-[var(--color-primary-700)] font-semibold hover:text-[var(--color-primary-600)]"
            >
              {isSignUp ? 'Inicia sesión' : 'Regístrate'}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
