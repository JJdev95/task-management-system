import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { vi } from 'vitest'
import { ResetPasswordPage } from './ResetPasswordPage'
import { renderWithProviders } from '../../test/testUtils'
import * as authApi from '../../api/authApi'

vi.mock('../../api/authApi', () => ({
  changePassword: vi.fn(),
  getCurrentUser: vi.fn(),
  login: vi.fn(),
  refreshToken: vi.fn(),
  register: vi.fn(),
  signOut: vi.fn(),
}))

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    vi.mocked(authApi.changePassword).mockResolvedValue(undefined)
    vi.mocked(authApi.signOut).mockResolvedValue(undefined)
  })

  it('keeps submit disabled until the password reset form is valid', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ResetPasswordPage />)

    const button = screen.getByRole('button', { name: /reset password/i })
    expect(button).toBeDisabled()

    await user.type(screen.getByLabelText(/current password/i, { selector: 'input' }), 'TaskForge123')
    await user.type(screen.getByLabelText(/^new password$/i, { selector: 'input' }), 'TaskForge124')
    await user.type(screen.getByLabelText(/confirm new password/i, { selector: 'input' }), 'TaskForge124')

    expect(button).toBeEnabled()
  })

  it('logs out and redirects to login after a successful password reset', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Routes>
        <Route path="/" element={<ResetPasswordPage />} />
        <Route path="/login" element={<div>Login destination</div>} />
      </Routes>,
    )

    await user.type(screen.getByLabelText(/current password/i, { selector: 'input' }), 'TaskForge123')
    await user.type(screen.getByLabelText(/^new password$/i, { selector: 'input' }), 'TaskForge124')
    await user.type(screen.getByLabelText(/confirm new password/i, { selector: 'input' }), 'TaskForge124')
    await user.click(screen.getByRole('button', { name: /reset password/i }))

    expect(await screen.findByText(/login destination/i)).toBeInTheDocument()
    expect(authApi.signOut).toHaveBeenCalledOnce()
  })

  it('can show and hide each password field', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ResetPasswordPage />)

    const currentPassword = screen.getByLabelText(/current password/i, { selector: 'input' })
    const newPassword = screen.getByLabelText(/^new password$/i, { selector: 'input' })
    const confirmPassword = screen.getByLabelText(/confirm new password/i, { selector: 'input' })

    await user.click(screen.getByRole('button', { name: /show current password/i }))
    await user.click(screen.getByRole('button', { name: /show new password/i }))
    await user.click(screen.getByRole('button', { name: /show confirm new password/i }))

    expect(currentPassword).toHaveAttribute('type', 'text')
    expect(newPassword).toHaveAttribute('type', 'text')
    expect(confirmPassword).toHaveAttribute('type', 'text')

    await user.click(screen.getByRole('button', { name: /hide current password/i }))
    await user.click(screen.getByRole('button', { name: /hide new password/i }))
    await user.click(screen.getByRole('button', { name: /hide confirm new password/i }))

    expect(currentPassword).toHaveAttribute('type', 'password')
    expect(newPassword).toHaveAttribute('type', 'password')
    expect(confirmPassword).toHaveAttribute('type', 'password')
  })
})
