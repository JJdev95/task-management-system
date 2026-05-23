import { render, type RenderOptions } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { configureStore } from '@reduxjs/toolkit'
import { ThemeProvider } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import authReducer from '../features/auth/authSlice'
import preferencesReducer from '../features/preferences/preferencesSlice'
import tasksReducer from '../features/tasks/tasksSlice'
import { createTaskForgeTheme } from '../theme/theme'
import type { ReactElement } from 'react'

export function renderWithProviders(ui: ReactElement, options?: RenderOptions) {
  const store = configureStore({
    reducer: {
      auth: authReducer,
      preferences: preferencesReducer,
      tasks: tasksReducer,
    },
  })
  const theme = createTaskForgeTheme('light')

  return {
    store,
    ...render(
      <Provider store={store}>
        <MemoryRouter>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            {ui}
          </ThemeProvider>
        </MemoryRouter>
      </Provider>,
      options,
    ),
  }
}
