import {
  getDragStatusTarget,
  getVisibleTaskStatuses,
  increasePriority,
  orderTasksByFocus,
  priorityAccentColors,
  taskStatuses,
} from './taskUtils'
import type { TaskItem } from './taskTypes'

const task: TaskItem = {
  id: 'task-1',
  title: 'Plan UI',
  description: '',
  status: 'Todo',
  priority: 'Medium',
  dueDate: '',
  createdAtUtc: '2026-05-20T10:00:00Z',
  updatedAtUtc: '2026-05-20T10:00:00Z',
  urgency: { kind: 'none', label: null },
}

function makeTask(id: string, priority: TaskItem['priority'], updatedAtUtc: string): TaskItem {
  return {
    ...task,
    id,
    title: id,
    priority,
    updatedAtUtc,
  }
}

describe('task utils', () => {
  it('raises priority one step at a time', () => {
    expect(increasePriority('Medium')).toBe('High')
    expect(increasePriority('Critical')).toBeNull()
  })

  it('uses a distinct error accent for critical priority', () => {
    expect(priorityAccentColors.Critical).toBe('error.main')
    expect(priorityAccentColors.Critical).not.toBe(priorityAccentColors.High)
  })

  it('returns the dragged status target when a card moves to a new column', () => {
    expect(getDragStatusTarget('task-1', 'InProgress', [task])).toBe('InProgress')
  })

  it('ignores drops onto the same column', () => {
    expect(getDragStatusTarget('task-1', 'Todo', [task])).toBeNull()
  })

  it('shows every status column when the status filter is empty', () => {
    expect(getVisibleTaskStatuses('')).toEqual(taskStatuses)
  })

  it('shows only the selected status column when the status filter is active', () => {
    expect(getVisibleTaskStatuses('Completed')).toEqual(['Completed'])
  })

  it('orders by priority first and earliest due date second', () => {
    const ordered = orderTasksByFocus(
      [
        { ...makeTask('medium', 'Medium', '2026-05-20T10:00:00Z'), dueDate: '2026-05-20' },
        { ...makeTask('critical-later', 'Critical', '2026-05-20T09:00:00Z'), dueDate: '2026-05-22' },
        { ...makeTask('critical-sooner', 'Critical', '2026-05-20T08:00:00Z'), dueDate: '2026-05-21' },
        { ...makeTask('high', 'High', '2026-05-20T08:00:00Z'), dueDate: '' },
      ],
    )

    expect(ordered.map((item) => item.id)).toEqual([
      'critical-sooner',
      'critical-later',
      'high',
      'medium',
    ])
  })
})
