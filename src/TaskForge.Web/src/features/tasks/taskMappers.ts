import { addDays, differenceInCalendarDays, isBefore, parseISO, startOfToday } from 'date-fns'
import type {
  ApiPaginatedTasks,
  ApiTaskRequest,
  ApiTask,
  CreateTaskInput,
  PaginatedTasks,
  TaskItem,
  TaskPriority,
  TaskStatus,
  UpdateTaskInput,
  Urgency,
} from './taskTypes'

const statusByNumber: Record<number, TaskStatus> = {
  1: 'Todo',
  2: 'InProgress',
  3: 'Blocked',
  4: 'Completed',
}

const priorityByNumber: Record<number, TaskPriority> = {
  1: 'Low',
  2: 'Medium',
  3: 'High',
  4: 'Critical',
}

const statusToNumber: Record<TaskStatus, number> = {
  Todo: 1,
  InProgress: 2,
  Blocked: 3,
  Completed: 4,
}

const priorityToNumber: Record<TaskPriority, number> = {
  Low: 1,
  Medium: 2,
  High: 3,
  Critical: 4,
}

export function normalizePaginatedTasks(data: ApiPaginatedTasks): PaginatedTasks {
  return {
    ...data,
    items: data.items.map(normalizeTask),
  }
}

export function normalizeTask(task: ApiTask): TaskItem {
  const status = normalizeStatus(task.status)
  const priority = normalizePriority(task.priority)

  return {
    ...task,
    status,
    priority,
    description: task.description ?? '',
    dueDate: task.dueDate ?? '',
    urgency: calculateUrgency(task.dueDate ?? null, status, priority),
  }
}

export function normalizeStatus(value: ApiTask['status']): TaskStatus {
  if (typeof value === 'number') {
    return statusByNumber[value] ?? 'Todo'
  }

  return value
}

export function normalizePriority(value: ApiTask['priority']): TaskPriority {
  if (typeof value === 'number') {
    return priorityByNumber[value] ?? 'Medium'
  }

  return value
}

export function mapStatusToApi(value: TaskStatus) {
  return statusToNumber[value]
}

export function mapPriorityToApi(value: TaskPriority) {
  return priorityToNumber[value]
}

export function toApiCreateTaskRequest(input: CreateTaskInput): ApiTaskRequest {
  return {
    title: input.title.trim(),
    description: input.description?.trim() || null,
    priority: mapPriorityToApi(input.priority),
    dueDate: input.dueDate || null,
  }
}

export function toApiUpdateTaskRequest(input: UpdateTaskInput): ApiTaskRequest {
  return {
    title: input.title.trim(),
    description: input.description?.trim() || null,
    status: mapStatusToApi(input.status),
    priority: mapPriorityToApi(input.priority),
    dueDate: input.dueDate || null,
  }
}

export function calculateUrgency(
  dueDate: string | null,
  status: TaskStatus,
  priority: TaskPriority,
): Urgency {
  if (status === 'Completed' || !dueDate) {
    return { kind: 'none', label: null }
  }

  const due = parseISO(dueDate)
  const today = startOfToday()

  if (isBefore(due, today)) {
    return { kind: 'overdue', label: 'Overdue' }
  }

  if (isBefore(due, addDays(today, 4))) {
    const days = differenceInCalendarDays(due, today)
    return { kind: 'soon', label: days === 0 ? 'Due today' : `Due in ${days}d` }
  }

  if (priority === 'Critical' || priority === 'High') {
    return { kind: 'important', label: null }
  }

  return { kind: 'none', label: null }
}
