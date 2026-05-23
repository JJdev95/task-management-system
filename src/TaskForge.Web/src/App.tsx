import { useEffect, useMemo } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { CssBaseline, LinearProgress, ThemeProvider } from '@mui/material'
import { AuthPage } from './features/auth/AuthPage'
import { restoreSession } from './features/auth/authSlice'
import { selectIsAuthenticated } from './features/auth/authSelectors'
import { ProtectedRoute } from './components/ProtectedRoute'
import { TaskBoardPage } from './features/tasks/TaskBoardPage'
import { ResetPasswordPage } from './features/auth/ResetPasswordPage'
import { useAppDispatch, useAppSelector } from './app/hooks'
import { selectThemeMode } from './features/preferences/preferencesSlice'
import { createTaskForgeTheme } from './theme/theme'

export default function App() {
  const dispatch = useAppDispatch()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const authInitialized = useAppSelector((state) => state.auth.initialized)
  const themeMode = useAppSelector(selectThemeMode)
  const theme = useMemo(() => createTaskForgeTheme(themeMode), [themeMode])

  useEffect(() => {
    void dispatch(restoreSession())
  }, [dispatch])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {!authInitialized && <LinearProgress />}
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/tasks" replace /> : <AuthPage mode="login" />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/tasks" replace /> : <AuthPage mode="register" />}
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <TaskBoardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <ProtectedRoute>
              <ResetPasswordPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to={isAuthenticated ? '/tasks' : '/login'} replace />} />
      </Routes>
    </ThemeProvider>
  )
}
