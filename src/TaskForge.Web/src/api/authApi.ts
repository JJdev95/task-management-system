import { apiClient, clearStoredTokens, readStoredTokens, storeTokens } from './http'
import type {
  AuthUser,
  ChangePasswordRequest,
  LoginRequest,
  RegisterRequest,
  TokenResponse,
} from '../features/auth/authTypes'

export async function login(request: LoginRequest) {
  const { data } = await apiClient.post<TokenResponse>('/api/auth/login', request)
  storeTokens(data)
  return data
}

export async function register(request: RegisterRequest) {
  const { data } = await apiClient.post<AuthUser>('/api/auth/signup', request)
  return data
}

export async function getCurrentUser() {
  const { data } = await apiClient.get<AuthUser>('/api/auth/me')
  return data
}

export async function refreshToken() {
  const tokens = readStoredTokens()
  if (!tokens?.refreshToken) {
    throw new Error('No refresh token is available.')
  }

  const { data } = await apiClient.post<TokenResponse>('/api/auth/refresh', {
    refreshToken: tokens.refreshToken,
  })
  storeTokens(data)
  return data
}

export async function signOut() {
  try {
    await apiClient.post('/api/auth/signout')
  } finally {
    clearStoredTokens()
  }
}

export async function changePassword(request: ChangePasswordRequest) {
  await apiClient.post('/api/auth/change-password', request)
}
