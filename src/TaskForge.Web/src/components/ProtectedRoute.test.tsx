import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { renderWithProviders } from '../test/testUtils'

describe('ProtectedRoute', () => {
  it('shows the loading session state before auth initialization finishes', () => {
    renderWithProviders(
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <div>Secret tasks</div>
            </ProtectedRoute>
          }
        />
      </Routes>,
    )

    expect(screen.getByLabelText(/loading session/i)).toBeInTheDocument()
  })
})
