export type AuthUser = {
  id: string
  email: string
}

export type TokenResponse = {
  accessToken: string
  refreshToken: string
}

export type LoginRequest = {
  email: string
  password: string
}

export type RegisterRequest = LoginRequest

export type ChangePasswordRequest = {
  currentPassword: string
  newPassword: string
}

export type AuthState = {
  tokens: TokenResponse | null
  user: AuthUser | null
  status: 'idle' | 'loading'
  initialized: boolean
  error: string | null
}
