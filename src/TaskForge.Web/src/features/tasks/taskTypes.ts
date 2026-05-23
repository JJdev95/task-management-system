export type TaskStatus = 'Todo' | 'InProgress' | 'Blocked' | 'Completed'
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical'

export type Urgency = {
  kind: 'none' | 'important' | 'soon' | 'overdue'
  label: string | null
}

export type ApiTask = {
  id: string
  title: string
  description: string | null
  status: TaskStatus | number
  priority: TaskPriority | number
  dueDate: string | null
  createdAtUtc: string
  updatedAtUtc: string
}

export type TaskItem = Omit<ApiTask, 'status' | 'priority' | 'description' | 'dueDate'> & {
  description: string
  status: TaskStatus
  priority: TaskPriority
  dueDate: string
  urgency: Urgency
}

export type ApiPaginatedTasks = {
  items: ApiTask[]
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export type PaginatedTasks = Omit<ApiPaginatedTasks, 'items'> & {
  items: TaskItem[]
}

export type TaskFilters = {
  pageNumber: number
  pageSize: number
  status: TaskStatus | ''
  priority: TaskPriority | ''
  search: string
  dueFrom: string
  dueTo: string
}

export type CreateTaskInput = {
  title: string
  description?: string
  priority: TaskPriority
  dueDate?: string
}

export type UpdateTaskInput = CreateTaskInput & {
  id: string
  status: TaskStatus
}

export type ApiTaskRequest = {
  title: string
  description: string | null
  status?: number
  priority: number
  dueDate: string | null
}

export type TasksState = {
  items: TaskItem[]
  filters: TaskFilters
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
  status: 'idle' | 'loading'
  mutationStatus: 'idle' | 'loading'
  error: string | null
}
