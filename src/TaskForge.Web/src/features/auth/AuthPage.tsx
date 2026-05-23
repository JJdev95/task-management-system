import { useState, type FormEvent } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Container,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined'
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined'
import { Logo } from '../../components/Logo'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { login, register } from './authSlice'
import { PasswordField } from './PasswordField'

type AuthPageProps = {
  mode: 'login' | 'register'
}

const pageText = {
  login: {
    title: 'Welcome back',
    subtitle: 'Sign in to see the work that needs your attention.',
    submit: 'Sign in',
    loading: 'Working...',
    prompt: 'New to TaskForge?',
    link: 'Create one',
    linkTo: '/register',
  },
  register: {
    title: 'Create your workspace',
    subtitle: 'Start organizing priorities, due dates, and daily progress.',
    submit: 'Create account',
    loading: 'Working...',
    prompt: 'Already have an account?',
    link: 'Sign in',
    linkTo: '/login',
  },
}

export function AuthPage({ mode }: AuthPageProps) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const status = useAppSelector((state) => state.auth.status)
  const authError = useAppSelector((state) => state.auth.error)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [touched, setTouched] = useState(false)

  const isRegister = mode === 'register'
  const copy = pageText[mode]
  const passwordInvalid = password.length > 0 && password.length < 8
  const emailInvalid = touched && !email.includes('@')
  const canSubmit = email.includes('@') && password.length >= 8 && status !== 'loading'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setTouched(true)

    if (!canSubmit) {
      return
    }

    const action = isRegister ? register({ email, password }) : login({ email, password })
    const result = await dispatch(action)

    if (login.fulfilled.match(result) || register.fulfilled.match(result)) {
      navigate('/tasks', { replace: true })
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        bgcolor: 'background.default',
        px: 2,
        py: 5,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 5 },
            border: 1,
            borderColor: 'divider',
            borderRadius: 3,
          }}
        >
          <Stack spacing={3}>
            <Logo />
            <Stack spacing={1}>
              <Typography variant="h3" component="h1">
                {copy.title}
              </Typography>
              <Typography color="text.secondary">{copy.subtitle}</Typography>
            </Stack>
            {authError && <Alert severity="error">{authError}</Alert>}
            <Box component="form" noValidate onSubmit={handleSubmit}>
              <Stack spacing={2.25}>
                <TextField
                  label="Email"
                  type="email"
                  value={email}
                  onBlur={() => setTouched(true)}
                  onChange={(event) => setEmail(event.target.value)}
                  error={emailInvalid}
                  helperText={emailInvalid ? 'Enter a valid email address.' : ' '}
                  autoComplete="email"
                  fullWidth
                />
                <PasswordField
                  label="Password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  error={passwordInvalid}
                  helperText={passwordInvalid ? 'Use at least 8 characters.' : ' '}
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  revealLabel="password"
                  fullWidth
                />
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={!canSubmit}
                  startIcon={isRegister ? <PersonAddAltOutlinedIcon /> : <LoginOutlinedIcon />}
                >
                  {status === 'loading' ? copy.loading : copy.submit}
                </Button>
              </Stack>
            </Box>
            <Typography color="text.secondary" align="center">
              {copy.prompt}{' '}
              <Link component={RouterLink} to={copy.linkTo}>
                {copy.link}
              </Link>
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  )
}
