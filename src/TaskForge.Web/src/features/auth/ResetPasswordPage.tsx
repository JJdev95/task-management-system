import { useState, type FormEvent } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined'
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined'
import { AppShell } from '../../components/AppShell'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { changePassword, logout } from './authSlice'
import { PasswordField } from './PasswordField'

const passwordRuleMessage = 'Use at least 8 characters with uppercase, lowercase, and a number.'

function meetsPasswordRules(password: string) {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password)
  )
}

export function ResetPasswordPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const status = useAppSelector((state) => state.auth.status)
  const authError = useAppSelector((state) => state.auth.error)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const currentPasswordInvalid = submitted && currentPassword.length === 0
  const newPasswordInvalid = submitted && !meetsPasswordRules(newPassword)
  const confirmPasswordInvalid = submitted && confirmPassword !== newPassword
  const isLoading = status === 'loading'
  const canSubmit =
    currentPassword.length > 0 &&
    meetsPasswordRules(newPassword) &&
    confirmPassword === newPassword &&
    !isLoading

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)

    if (!canSubmit) {
      return
    }

    const result = await dispatch(changePassword({ currentPassword, newPassword }))

    if (changePassword.fulfilled.match(result)) {
      await dispatch(logout())
      navigate('/login', { replace: true })
    }
  }

  return (
    <AppShell>
      <Box sx={{ maxWidth: 680 }}>
        <Stack spacing={3}>
          <Button
            component={RouterLink}
            to="/tasks"
            variant="text"
            startIcon={<ArrowBackOutlinedIcon />}
            sx={{ alignSelf: 'flex-start' }}
          >
            Back to tasks
          </Button>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 4 },
              border: 1,
              borderColor: 'divider',
              borderRadius: 3,
            }}
          >
            <Stack spacing={3}>
              <Stack spacing={1}>
                <Typography variant="h4" component="h1">
                  Reset password
                </Typography>
                <Typography color="text.secondary">
                  Choose a new password for the account you are currently signed into.
                </Typography>
              </Stack>
              {authError && <Alert severity="error">{authError}</Alert>}
              <Box component="form" noValidate onSubmit={handleSubmit}>
                <Stack spacing={2.25}>
                  <PasswordField
                    label="Current password"
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    error={currentPasswordInvalid}
                    helperText={currentPasswordInvalid ? 'Enter your current password.' : ' '}
                    autoComplete="current-password"
                    revealLabel="current password"
                    fullWidth
                  />
                  <PasswordField
                    label="New password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    error={newPasswordInvalid}
                    helperText={newPasswordInvalid ? passwordRuleMessage : ' '}
                    autoComplete="new-password"
                    revealLabel="new password"
                    fullWidth
                  />
                  <PasswordField
                    label="Confirm new password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    error={confirmPasswordInvalid}
                    helperText={confirmPasswordInvalid ? 'Passwords must match.' : ' '}
                    autoComplete="new-password"
                    revealLabel="confirm new password"
                    fullWidth
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={!canSubmit}
                    startIcon={<LockResetOutlinedIcon />}
                  >
                    {isLoading ? 'Resetting...' : 'Reset password'}
                  </Button>
                </Stack>
              </Box>
            </Stack>
          </Paper>
        </Stack>
      </Box>
    </AppShell>
  )
}
