import type { UniqueIdentifier } from '@dnd-kit/core'
import type { TaskItem, TaskPriority, TaskStatus } from './taskTypes'

export const taskStatuses: TaskStatus[] = ['Todo', 'InProgress', 'Blocked', 'Completed']
export const taskPriorities: TaskPriority[] = ['Low', 'Medium', 'High', 'Critical']

export const statusLabels: Record<TaskStatus, string> = {
  Todo: 'Todo',
  InProgress: 'In progress',
  Blocked: 'Blocked',
  Completed: 'Completed',
}

export const priorityLabels: Record<TaskPriority, string> = {
  Low: 'Low',
  Medium: 'Medium',
  High: 'High',
  Critical: 'Critical',
}

export const priorityColors: Record<TaskPriority, 'default' | 'info' | 'warning' | 'error'> = {
  Low: 'default',
  Medium: 'info',
  High: 'warning',
  Critical: 'error',
}

export const priorityAccentColors: Record<TaskPriority, string> = {
  Low: 'grey.400',
  Medium: 'info.main',
  High: 'warning.main',
  Critical: 'error.main',
}

export function getVisibleTaskStatuses(statusFilter: TaskStatus | ''): TaskStatus[] {
  return statusFilter ? [statusFilter] : taskStatuses
}

export function increasePriority(priority: TaskPriority): TaskPriority | null {
  const index = taskPriorities.indexOf(priority)
  return taskPriorities[index + 1] ?? null
}

export function decreasePriority(priority: TaskPriority): TaskPriority | null {
  const index = taskPriorities.indexOf(priority)
  return taskPriorities[index - 1] ?? null
}

export function getDragStatusTarget(
  activeId: UniqueIdentifier,
  overId: UniqueIdentifier | undefined,
  tasks: TaskItem[],
): TaskStatus | null {
  if (!overId || !taskStatuses.includes(overId as TaskStatus)) {
    return null
  }

  const task = tasks.find((item) => item.id === activeId)
  const targetStatus = overId as TaskStatus

  if (!task || task.status === targetStatus) {
    return null
  }

  return targetStatus
}

export function orderTasksByFocus(tasks: TaskItem[]): TaskItem[] {
  return [...tasks].sort((left, right) => {
    const priorityComparison =
      taskPriorities.indexOf(right.priority) - taskPriorities.indexOf(left.priority)
    if (priorityComparison !== 0) {
      return priorityComparison
    }

    const dueDateComparison = compareOptionalDates(left.dueDate, right.dueDate)
    if (dueDateComparison !== 0) {
      return dueDateComparison
    }

    return Date.parse(right.updatedAtUtc) - Date.parse(left.updatedAtUtc)
  })
}

function compareOptionalDates(left: string, right: string): number {
  if (!left && !right) {
    return 0
  }

  if (!left) {
    return 1
  }

  if (!right) {
    return -1
  }

  return Date.parse(left) - Date.parse(right)
}
