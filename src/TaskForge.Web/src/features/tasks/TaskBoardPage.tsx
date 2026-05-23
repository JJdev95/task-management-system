import { useEffect } from 'react'
import { AppShell } from '../../components/AppShell'
import { useAppDispatch } from '../../app/hooks'
import { fetchTasks } from './tasksSlice'
import { TaskBoard } from './TaskBoard'

export function TaskBoardPage() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    void dispatch(fetchTasks())
  }, [dispatch])

  return (
    <AppShell>
      <TaskBoard />
    </AppShell>
  )
}
