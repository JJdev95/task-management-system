import type { RootState } from '../../app/store'

export const selectCurrentUser = (state: RootState) => state.auth.user
export const selectAuthInitialized = (state: RootState) => state.auth.initialized
export const selectIsAuthenticated = (state: RootState) =>
  Boolean(state.auth.tokens?.accessToken && state.auth.user)
