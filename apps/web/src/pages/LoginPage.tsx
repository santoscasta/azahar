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
        background: 'linear-gradient(135deg, #e8f1fb, #dfe9f7)',
      }}
    >
      <div className="w-full max-w-lg">
        <div className="rounded-[32px] bg-white shadow-[0_25px_60px_rgba(15,23,42,0.15)] border border-slate-100 px-10 py-10">
          <div className="flex flex-col items-center text-center space-y-3 mb-10">
            <div className="h-16 w-16 rounded-3xl bg-gradient-to-br from-blue-200 to-blue-400 flex items-center justify-center shadow-inner">
              <img src="/icons/icon-120.png" alt="Azahar" className="h-10 w-10" />
            </div>
            <div>
              <p className="text-3xl font-black tracking-wide text-slate-900">AZAHAR</p>
              <p className="text-slate-500">Inicia sesión para continuar</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-600" htmlFor={emailInputId}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                id={emailInputId}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="tu@ejemplo.com"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-600" htmlFor={passwordInputId}>
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                id={passwordInputId}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
              <div className="text-right">
                <a
                  href="mailto:soporte@azahar.app"
                  className="text-xs text-blue-600 font-medium hover:text-blue-700"
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
              className="w-full py-3 rounded-2xl bg-[#5b79a1] text-white font-semibold shadow-[0_12px_20px_rgba(62,99,134,0.25)] hover:bg-[#4f6a8d] transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Cargando...' : isSignUp ? 'Registrarse' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            {isSignUp ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
            {' '}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-blue-600 font-semibold hover:text-blue-700"
            >
              {isSignUp ? 'Inicia sesión' : 'Regístrate'}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
