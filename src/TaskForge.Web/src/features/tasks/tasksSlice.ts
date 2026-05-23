import { createAsyncThunk, createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import * as tasksApi from '../../api/tasksApi'
import type { RootState } from '../../app/store'
import type {
  CreateTaskInput,
  TaskFilters,
  TaskItem,
  TaskStatus,
  TasksState,
  UpdateTaskInput,
} from './taskTypes'
import { orderTasksByFocus, taskStatuses } from './taskUtils'

const defaultFilters: TaskFilters = {
  pageNumber: 1,
  pageSize: 50,
  status: '',
  priority: '',
  search: '',
  dueFrom: '',
  dueTo: '',
}

const initialState: TasksState = {
  items: [],
  filters: defaultFilters,
  pageNumber: 1,
  pageSize: 50,
  totalCount: 0,
  totalPages: 0,
  hasPreviousPage: false,
  hasNextPage: false,
  status: 'idle',
  mutationStatus: 'idle',
  error: null,
}

export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async (_, { getState, rejectWithValue }) => {
  try {
    const state = getState() as RootState
    return await tasksApi.getTasks(state.tasks.filters)
  } catch {
    return rejectWithValue('Could not load tasks.')
  }
})

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (input: CreateTaskInput, { rejectWithValue }) => {
    try {
      return await tasksApi.createTask(input)
    } catch {
      return rejectWithValue('Could not create the task.')
    }
  },
)

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async (input: UpdateTaskInput, { rejectWithValue }) => {
    try {
      return await tasksApi.updateTask(input)
    } catch {
      return rejectWithValue('Could not update the task.')
    }
  },
)

export const deleteTask = createAsyncThunk('tasks/deleteTask', async (id: string, { rejectWithValue }) => {
  try {
    return await tasksApi.deleteTask(id)
  } catch {
    return rejectWithValue('Could not delete the task.')
  }
})

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<Partial<TaskFilters>>) {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters(state) {
      state.filters = defaultFilters
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        applyTaskPage(state, action.payload)
        state.status = 'idle'
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = 'idle'
        state.error = String(action.payload ?? 'Could not load tasks.')
      })
      .addCase(createTask.pending, setMutationLoading)
      .addCase(createTask.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
        state.totalCount += 1
        state.mutationStatus = 'idle'
      })
      .addCase(createTask.rejected, setMutationError)
      .addCase(updateTask.pending, setMutationLoading)
      .addCase(updateTask.fulfilled, (state, action) => {
        state.items = state.items.map((task) => (task.id === action.payload.id ? action.payload : task))
        state.mutationStatus = 'idle'
      })
      .addCase(updateTask.rejected, setMutationError)
      .addCase(deleteTask.pending, setMutationLoading)
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.items = state.items.filter((task) => task.id !== action.payload)
        state.totalCount = Math.max(0, state.totalCount - 1)
        state.mutationStatus = 'idle'
      })
      .addCase(deleteTask.rejected, setMutationError)
  },
})

function applyTaskPage(state: TasksState, page: Awaited<ReturnType<typeof tasksApi.getTasks>>) {
  state.items = page.items
  state.pageNumber = page.pageNumber
  state.pageSize = page.pageSize
  state.totalCount = page.totalCount
  state.totalPages = page.totalPages
  state.hasPreviousPage = page.hasPreviousPage
  state.hasNextPage = page.hasNextPage
}

function setMutationLoading(state: TasksState) {
  state.mutationStatus = 'loading'
  state.error = null
}

function setMutationError(state: TasksState, action: { payload: unknown }) {
  state.mutationStatus = 'idle'
  state.error = String(action.payload ?? 'Task change failed.')
}

export const { setFilters, clearFilters } = tasksSlice.actions

export const selectTasksByStatus = createSelector(
  (state: RootState) => state.tasks.items,
  (tasks): Record<TaskStatus, TaskItem[]> =>
    taskStatuses.reduce(
      (result, status) => {
        result[status] = orderTasksByFocus(tasks.filter((task) => task.status === status))
        return result
      },
      {} as Record<TaskStatus, TaskItem[]>,
    ),
)

export default tasksSlice.reducer
