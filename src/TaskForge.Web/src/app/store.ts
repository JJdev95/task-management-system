import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import preferencesReducer from '../features/preferences/preferencesSlice'
import tasksReducer from '../features/tasks/tasksSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    preferences: preferencesReducer,
    tasks: tasksReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
