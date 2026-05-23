import { apiClient } from './http'
import {
  normalizePaginatedTasks,
  normalizeTask,
  toApiCreateTaskRequest,
  toApiUpdateTaskRequest,
} from '../features/tasks/taskMappers'
import type {
  CreateTaskInput,
  PaginatedTasks,
  TaskFilters,
  TaskItem,
  UpdateTaskInput,
} from '../features/tasks/taskTypes'

export async function getTasks(filters: TaskFilters): Promise<PaginatedTasks> {
  const params = {
    pageNumber: filters.pageNumber,
    pageSize: filters.pageSize,
    status: filters.status || undefined,
    priority: filters.priority || undefined,
    search: filters.search || undefined,
    dueFrom: filters.dueFrom || undefined,
    dueTo: filters.dueTo || undefined,
  }

  const { data } = await apiClient.get('/api/tasks', { params })
  return normalizePaginatedTasks(data)
}

export async function createTask(input: CreateTaskInput): Promise<TaskItem> {
  const { data } = await apiClient.post('/api/tasks', toApiCreateTaskRequest(input))
  return normalizeTask(data)
}

export async function updateTask(input: UpdateTaskInput): Promise<TaskItem> {
  const { data } = await apiClient.put(`/api/tasks/${input.id}`, toApiUpdateTaskRequest(input))
  return normalizeTask(data)
}

export async function deleteTask(id: string): Promise<string> {
  await apiClient.delete(`/api/tasks/${id}`)
  return id
}
