import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import * as authApi from '../../api/authApi'
import { clearStoredTokens, readStoredTokens } from '../../api/http'
import type {
  AuthState,
  AuthUser,
  ChangePasswordRequest,
  LoginRequest,
  RegisterRequest,
  TokenResponse,
} from './authTypes'

type AuthSession = {
  tokens: TokenResponse
  user: AuthUser
}

const initialState: AuthState = {
  tokens: readStoredTokens(),
  user: null,
  status: 'idle',
  initialized: false,
  error: null,
}

export const restoreSession = createAsyncThunk('auth/restoreSession', async (_, { rejectWithValue }) => {
  if (!readStoredTokens()) {
    return null
  }

  try {
    return await authApi.getCurrentUser()
  } catch {
    try {
      await authApi.refreshToken()
      return await authApi.getCurrentUser()
    } catch {
      clearStoredTokens()
      return rejectWithValue('Your session has expired. Please sign in again.')
    }
  }
})

export const login = createAsyncThunk('auth/login', async (request: LoginRequest, { rejectWithValue }) => {
  try {
    const tokens = await authApi.login(request)
    const user = await authApi.getCurrentUser()
    return { tokens, user }
  } catch {
    return rejectWithValue('Invalid email or password.')
  }
})

export const register = createAsyncThunk(
  'auth/register',
  async (request: RegisterRequest, { rejectWithValue }) => {
    try {
      await authApi.register(request)
      const tokens = await authApi.login(request)
      const user = await authApi.getCurrentUser()
      return { tokens, user }
    } catch {
      return rejectWithValue('Could not create your account. Check the email and password rules.')
    }
  },
)

export const logout = createAsyncThunk('auth/logout', async () => {
  await authApi.signOut().catch(() => undefined)
})

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (request: ChangePasswordRequest, { rejectWithValue }) => {
    try {
      await authApi.changePassword(request)
    } catch {
      return rejectWithValue('Could not reset your password. Check your current password and try again.')
    }
  },
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(restoreSession.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.user = action.payload
        state.tokens = readStoredTokens()
        state.status = 'idle'
        state.initialized = true
        state.error = null
      })
      .addCase(restoreSession.rejected, (state, action) => {
        state.user = null
        state.tokens = null
        state.status = 'idle'
        state.initialized = true
        state.error = String(action.payload ?? 'Please sign in again.')
      })
      .addCase(login.pending, setAuthLoading)
      .addCase(login.fulfilled, (state, action) => {
        setAuthSession(state, action.payload)
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'idle'
        state.error = String(action.payload ?? 'Sign in failed.')
      })
      .addCase(register.pending, setAuthLoading)
      .addCase(register.fulfilled, (state, action) => {
        setAuthSession(state, action.payload)
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'idle'
        state.error = String(action.payload ?? 'Registration failed.')
      })
      .addCase(logout.fulfilled, (state) => {
        state.tokens = null
        state.user = null
        state.status = 'idle'
        state.initialized = true
        state.error = null
      })
      .addCase(changePassword.pending, setAuthLoading)
      .addCase(changePassword.fulfilled, (state) => {
        state.status = 'idle'
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.status = 'idle'
        state.error = String(action.payload ?? 'Password reset failed.')
      })
  },
})

function setAuthLoading(state: AuthState) {
  state.status = 'loading'
  state.error = null
}

function setAuthSession(state: AuthState, session: AuthSession) {
  state.tokens = session.tokens
  state.user = session.user
  state.status = 'idle'
  state.initialized = true
}

export default authSlice.reducer
