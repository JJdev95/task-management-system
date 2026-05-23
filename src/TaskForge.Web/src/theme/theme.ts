import { createTheme } from '@mui/material/styles'
import type { ThemeMode } from '../features/preferences/preferencesSlice'

export function createTaskForgeTheme(mode: ThemeMode) {
  const isDark = mode === 'dark'

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? '#7dd3fc' : '#0f766e',
      },
      secondary: {
        main: isDark ? '#c4b5fd' : '#7c3aed',
      },
      background: {
        default: isDark ? '#0b1020' : '#f6f8fb',
        paper: isDark ? '#111827' : '#ffffff',
      },
      success: {
        main: '#16a34a',
      },
      warning: {
        main: '#f59e0b',
      },
      error: {
        main: '#ef4444',
      },
    },
    shape: {
      borderRadius: 10,
    },
    typography: {
      fontFamily:
        'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      h3: {
        fontSize: 'clamp(2rem, 4vw, 3.25rem)',
        fontWeight: 850,
        letterSpacing: 0,
      },
      h6: {
        letterSpacing: 0,
      },
      button: {
        fontWeight: 700,
        letterSpacing: 0,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            textTransform: 'none',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 10,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  })
}
