import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthPage } from './AuthPage'
import { renderWithProviders } from '../../test/testUtils'

describe('AuthPage', () => {
  it('keeps submit disabled until the form has a valid email and password', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AuthPage mode="login" />)

    const button = screen.getByRole('button', { name: /sign in/i })
    expect(button).toBeDisabled()

    await user.type(screen.getByLabelText(/email/i), 'person@taskforge.local')
    await user.type(screen.getByLabelText(/password/i, { selector: 'input' }), 'TaskForge123')

    expect(button).toBeEnabled()
  })

  it('can show and hide the password value', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AuthPage mode="login" />)

    const passwordInput = screen.getByLabelText(/password/i, { selector: 'input' })
    expect(passwordInput).toHaveAttribute('type', 'password')

    await user.click(screen.getByRole('button', { name: /show password/i }))
    expect(passwordInput).toHaveAttribute('type', 'text')

    await user.click(screen.getByRole('button', { name: /hide password/i }))
    expect(passwordInput).toHaveAttribute('type', 'password')
  })
})
