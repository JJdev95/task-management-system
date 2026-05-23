import { calculateUrgency, mapPriorityToApi, normalizeTask, toApiUpdateTaskRequest } from './taskMappers'

describe('task mappers', () => {
  it('normalizes numeric backend enums into frontend names', () => {
    const task = normalizeTask({
      id: 'task-1',
      title: 'Ship frontend',
      description: null,
      status: 2,
      priority: 4,
      dueDate: '2026-05-20',
      createdAtUtc: '2026-05-19T10:00:00Z',
      updatedAtUtc: '2026-05-19T10:00:00Z',
    })

    expect(task.status).toBe('InProgress')
    expect(task.priority).toBe('Critical')
    expect(task.description).toBe('')
  })

  it('maps priority names to API numeric enum values', () => {
    expect(mapPriorityToApi('High')).toBe(3)
  })

  it('builds trimmed task update payloads for the API', () => {
    expect(
      toApiUpdateTaskRequest({
        id: 'task-1',
        title: '  Ship UI  ',
        description: '  polish cards  ',
        status: 'Blocked',
        priority: 'Critical',
        dueDate: '2026-05-21',
      }),
    ).toEqual({
      title: 'Ship UI',
      description: 'polish cards',
      status: 3,
      priority: 4,
      dueDate: '2026-05-21',
    })
  })

  it('marks important high-priority tasks when due date is distant', () => {
    const urgency = calculateUrgency('2099-01-01', 'Todo', 'High')
    expect(urgency).toEqual({ kind: 'important', label: null })
  })
})
