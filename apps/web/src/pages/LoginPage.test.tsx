import { describe, it, afterEach, expect, vi } from 'vitest'
import { fireEvent, cleanup, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../tests/renderWithProviders'
import LoginPage from './LoginPage'

describe('LoginPage', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('renders branding and form fields', () => {
    const view = renderWithProviders(
      <LoginPage
        navigateTo={vi.fn()}
        authClient={{ signIn: vi.fn(), signUp: vi.fn() }}
      />
    )
    expect(view.getByText('AZAHAR')).toBeDefined()
    expect(view.getByLabelText('Email')).toBeDefined()
    expect(view.getByLabelText('Contraseña')).toBeDefined()
    expect(view.getByRole('button', { name: 'Entrar' })).toBeDefined()
  })

  it('submits login successfully and navigates', async () => {
    const signInMock = vi.fn().mockResolvedValue({ success: true })
    const navigateMock = vi.fn()
    const view = renderWithProviders(<LoginPage authClient={{ signIn: signInMock, signUp: vi.fn() }} navigateTo={navigateMock} />)

    fireEvent.change(view.getByLabelText('Email'), { target: { value: 'test@example.com' } })
    fireEvent.change(view.getByLabelText('Contraseña'), { target: { value: 'secret' } })
    fireEvent.click(view.getByRole('button', { name: 'Entrar' }))

    expect(signInMock).toHaveBeenCalledWith('test@example.com', 'secret')
    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/app')
    })
  })

  it('allows switching to sign up and calls signUp', async () => {
    const signInMock = vi.fn()
    const signUpMock = vi.fn().mockResolvedValue({ success: true })
    const navigateMock = vi.fn()
    const view = renderWithProviders(<LoginPage authClient={{ signIn: signInMock, signUp: signUpMock }} navigateTo={navigateMock} />)

    fireEvent.click(view.getByRole('button', { name: 'Regístrate' }))
    fireEvent.change(view.getByLabelText('Email'), { target: { value: 'new@example.com' } })
    fireEvent.change(view.getByLabelText('Contraseña'), { target: { value: 'secret' } })
    fireEvent.click(view.getByRole('button', { name: 'Registrarse' }))

    expect(signUpMock).toHaveBeenCalledWith('new@example.com', 'secret')
    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/app')
    })
  })

  it('shows error message on failure', async () => {
    const signInMock = vi.fn().mockResolvedValue({ success: false, error: 'Credenciales inválidas' })
    const navigateMock = vi.fn()
    const view = renderWithProviders(<LoginPage authClient={{ signIn: signInMock, signUp: vi.fn() }} navigateTo={navigateMock} />)

    fireEvent.change(view.getByLabelText('Email'), { target: { value: 'bad@example.com' } })
    fireEvent.change(view.getByLabelText('Contraseña'), { target: { value: 'wrong' } })
    fireEvent.click(view.getByRole('button', { name: 'Entrar' }))

    expect(await view.findByText('Credenciales inválidas')).toBeDefined()
    expect(navigateMock).not.toHaveBeenCalled()
  })

  it('shows loading state while submitting', async () => {
    const signInMock = vi.fn(
      () =>
        new Promise<{ success: boolean }>((resolve) => {
          setTimeout(() => resolve({ success: true }), 5)
        })
    )
    const view = renderWithProviders(<LoginPage authClient={{ signIn: signInMock, signUp: vi.fn() }} navigateTo={vi.fn()} />)

    fireEvent.change(view.getByLabelText('Email'), { target: { value: 'test@example.com' } })
    fireEvent.change(view.getByLabelText('Contraseña'), { target: { value: 'secret' } })
    fireEvent.click(view.getByRole('button', { name: 'Entrar' }))

    const loadingButton = view.getByRole('button', { name: 'Cargando...' }) as HTMLButtonElement
    expect(loadingButton.disabled).toBe(true)

    await waitFor(() => {
      expect(loadingButton.disabled).toBe(false)
    })
  })

  it('handles unexpected sign-in errors', async () => {
    const signInMock = vi.fn().mockRejectedValue(new Error('Network'))
    const navigateMock = vi.fn()
    const view = renderWithProviders(<LoginPage authClient={{ signIn: signInMock, signUp: vi.fn() }} navigateTo={navigateMock} />)

    fireEvent.change(view.getByLabelText('Email'), { target: { value: 'oops@example.com' } })
    fireEvent.change(view.getByLabelText('Contraseña'), { target: { value: 'secret' } })
    fireEvent.click(view.getByRole('button', { name: 'Entrar' }))

    expect(await view.findByText('Error inesperado')).toBeDefined()
    expect(navigateMock).not.toHaveBeenCalled()
  })

  it('toggles between login and signup views', () => {
    const view = renderWithProviders(<LoginPage authClient={{ signIn: vi.fn(), signUp: vi.fn() }} navigateTo={vi.fn()} />)
    expect(view.getByRole('button', { name: 'Entrar' })).toBeDefined()

    fireEvent.click(view.getByRole('button', { name: 'Regístrate' }))
    expect(view.getByRole('button', { name: 'Registrarse' })).toBeDefined()
  })

  it('shows error when sign up fails', async () => {
    const signUpMock = vi.fn().mockResolvedValue({ success: false, error: 'Email en uso' })
    const view = renderWithProviders(<LoginPage authClient={{ signIn: vi.fn(), signUp: signUpMock }} navigateTo={vi.fn()} />)

    fireEvent.click(view.getByRole('button', { name: 'Regístrate' }))
    fireEvent.change(view.getByLabelText('Email'), { target: { value: 'taken@example.com' } })
    fireEvent.change(view.getByLabelText('Contraseña'), { target: { value: 'secret' } })
    fireEvent.click(view.getByRole('button', { name: 'Registrarse' }))

    await waitFor(() => {
      expect(view.getByText('Email en uso')).toBeDefined()
    })
    expect(signUpMock).toHaveBeenCalledWith('taken@example.com', 'secret')
  })

  it('clears previous errors after a successful retry', async () => {
    const signInMock = vi
      .fn()
      .mockResolvedValueOnce({ success: false, error: 'Credenciales inválidas' })
      .mockResolvedValueOnce({ success: true })
    const navigateMock = vi.fn()
    const view = renderWithProviders(<LoginPage authClient={{ signIn: signInMock, signUp: vi.fn() }} navigateTo={navigateMock} />)

    fireEvent.change(view.getByLabelText('Email'), { target: { value: 'retry@example.com' } })
    fireEvent.change(view.getByLabelText('Contraseña'), { target: { value: 'secret' } })
    fireEvent.click(view.getByRole('button', { name: 'Entrar' }))
    expect(await view.findByText('Credenciales inválidas')).toBeDefined()

    fireEvent.click(view.getByRole('button', { name: 'Entrar' }))
    await waitFor(() => {
      expect(view.queryByText('Credenciales inválidas')).toBeNull()
      expect(navigateMock).toHaveBeenCalledWith('/app')
    })
  })

  it('shows the support email link for password reset', () => {
    const view = renderWithProviders(<LoginPage authClient={{ signIn: vi.fn(), signUp: vi.fn() }} navigateTo={vi.fn()} />)
    const link = view.getByText('¿Olvidaste tu contraseña?') as HTMLAnchorElement
    expect(link.getAttribute('href')).toBe('mailto:soporte@azahar.app')
  })
})
