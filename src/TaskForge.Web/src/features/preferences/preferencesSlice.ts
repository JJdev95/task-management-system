import { createSlice } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'

export type ThemeMode = 'light' | 'dark'

type PreferencesState = {
  themeMode: ThemeMode
}

const THEME_KEY = 'taskforge.themeMode'

function getInitialThemeMode(): ThemeMode {
  const stored = localStorage.getItem(THEME_KEY)
  if (stored === 'light' || stored === 'dark') {
    return stored
  }

  return globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState: {
    themeMode: getInitialThemeMode(),
  } satisfies PreferencesState,
  reducers: {
    toggleThemeMode(state) {
      state.themeMode = state.themeMode === 'light' ? 'dark' : 'light'
      localStorage.setItem(THEME_KEY, state.themeMode)
    },
  },
})

export const { toggleThemeMode } = preferencesSlice.actions
export const selectThemeMode = (state: RootState) => state.preferences.themeMode
export default preferencesSlice.reducer
