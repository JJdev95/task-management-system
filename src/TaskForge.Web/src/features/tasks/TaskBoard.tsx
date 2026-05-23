import { useMemo, useState, type ReactNode } from 'react'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import BoltRoundedIcon from '@mui/icons-material/BoltRounded'
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import { TaskCard } from './TaskCard'
import { TaskColumn } from './TaskColumn'
import { TaskDialog } from './TaskDialog'
import { TaskFiltersToolbar } from './TaskFiltersToolbar'
import { fetchTasks, selectTasksByStatus, updateTask } from './tasksSlice'
import { getDragStatusTarget, getVisibleTaskStatuses, statusLabels } from './taskUtils'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import type { TaskItem } from './taskTypes'

const columnAccents = {
  Todo: 'info.main',
  InProgress: 'primary.main',
  Blocked: 'error.main',
  Completed: 'success.main',
}

const emptyStatusMessage = (status: TaskItem['status']) =>
  `Drop tasks into ${statusLabels[status].toLowerCase()}.`

export function TaskBoard() {
  const dispatch = useAppDispatch()
  const tasksByStatus = useAppSelector(selectTasksByStatus)
  const tasks = useAppSelector((state) => state.tasks.items)
  const statusFilter = useAppSelector((state) => state.tasks.filters.status)
  const status = useAppSelector((state) => state.tasks.status)
  const error = useAppSelector((state) => state.tasks.error)
  const totalCount = useAppSelector((state) => state.tasks.totalCount)
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor))
  const taskMetrics = useMemo(() => {
    return tasks.reduce(
      (metrics, task) => {
        if (task.status === 'Completed') {
          metrics.completed += 1
          return metrics
        }

        metrics.active += 1

        if (task.urgency.kind === 'overdue') {
          metrics.overdue += 1
        }

        if (task.urgency.kind === 'soon') {
          metrics.dueSoon += 1
        }

        if (task.priority === 'High' || task.priority === 'Critical') {
          metrics.important += 1
        }

        return metrics
      },
      { active: 0, overdue: 0, dueSoon: 0, important: 0, completed: 0 },
    )
  }, [tasks])
  const metricCards = [
    { label: 'Active', value: taskMetrics.active, icon: <BoltRoundedIcon />, color: 'primary.main' },
    { label: 'Due soon', value: taskMetrics.dueSoon, icon: <ScheduleRoundedIcon />, color: 'warning.main' },
    { label: 'High focus', value: taskMetrics.important, icon: <WarningAmberRoundedIcon />, color: 'error.main' },
    { label: 'Done', value: taskMetrics.completed, icon: <CheckCircleOutlineRoundedIcon />, color: 'success.main' },
  ]
  const hasTasks = tasks.length > 0
  const isLoadingInitial = status === 'loading' && !hasTasks
  const visibleTaskStatuses = getVisibleTaskStatuses(statusFilter)
  const isStatusFiltered = statusFilter !== ''

  function handleCreate() {
    setEditingTask(null)
    setDialogOpen(true)
  }

  function handleEdit(task: TaskItem) {
    setEditingTask(task)
    setDialogOpen(true)
  }

  function handleDragEnd(event: DragEndEvent) {
    const targetStatus = getDragStatusTarget(event.active.id, event.over?.id, tasks)
    const task = tasks.find((item) => item.id === event.active.id)

    if (!targetStatus || !task) {
      return
    }

    void dispatch(updateTask({ ...task, status: targetStatus }))
  }

  return (
    <Stack spacing={2.5}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{
          alignItems: { xs: 'stretch', md: 'center' },
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography variant="h3" component="h1">
            Tasks
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', rowGap: 1 }}>
            <Chip label={`${totalCount} total`} size="small" />
            <Chip
              color={taskMetrics.overdue > 0 ? 'error' : 'default'}
              label={`${taskMetrics.overdue} overdue`}
              size="small"
            />
          </Stack>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<RefreshRoundedIcon />} onClick={() => void dispatch(fetchTasks())}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={handleCreate}>
            Add task
          </Button>
        </Stack>
      </Stack>

      <TaskFiltersToolbar />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(4, minmax(0, 1fr))',
          },
          gap: 1.5,
        }}
      >
        {metricCards.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {!isLoadingInitial && !hasTasks && (
        <EmptyBoardState onCreate={handleCreate} />
      )}

      {hasTasks && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: isStatusFiltered ? '1fr' : 'repeat(2, minmax(0, 1fr))',
                xl: isStatusFiltered ? '1fr' : 'repeat(4, minmax(0, 1fr))',
              },
              gap: 2,
              alignItems: 'start',
            }}
          >
            {visibleTaskStatuses.map((taskStatus) => (
              <TaskColumn
                key={taskStatus}
                id={taskStatus}
                title={statusLabels[taskStatus]}
                count={tasksByStatus[taskStatus].length}
                accentColor={columnAccents[taskStatus]}
                expanded={isStatusFiltered}
              >
                {tasksByStatus[taskStatus].map((task) => (
                  <TaskCard key={task.id} task={task} onEdit={handleEdit} />
                ))}
                {tasksByStatus[taskStatus].length === 0 && (
                  <EmptyColumnMessage>{emptyStatusMessage(taskStatus)}</EmptyColumnMessage>
                )}
              </TaskColumn>
            ))}
          </Box>
        </DndContext>
      )}

      {status === 'loading' && (
        <Box sx={{ display: 'grid', placeItems: 'center', py: 4 }}>
          <CircularProgress aria-label="Loading tasks" />
        </Box>
      )}

      <TaskDialog
        open={dialogOpen}
        task={editingTask}
        onClose={() => setDialogOpen(false)}
        onSaved={() => setDialogOpen(false)}
      />
    </Stack>
  )
}

function EmptyBoardState({ onCreate }: { onCreate: () => void }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, md: 5 },
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        textAlign: 'center',
        bgcolor: 'background.paper',
      }}
    >
      <Stack spacing={2} sx={{ alignItems: 'center', maxWidth: 520, mx: 'auto' }}>
        <Box
          sx={{
            width: 54,
            height: 54,
            borderRadius: 2,
            display: 'grid',
            placeItems: 'center',
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
          }}
        >
          <AddRoundedIcon />
        </Box>
        <Box>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 850 }}>
            Nothing needs attention yet
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75 }}>
            Create a task or clear filters to bring work back into view.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={onCreate}>
          Add task
        </Button>
      </Stack>
    </Paper>
  )
}

function EmptyColumnMessage({ children }: { children: ReactNode }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderStyle: 'dashed',
        color: 'text.secondary',
        textAlign: 'center',
        bgcolor: 'transparent',
      }}
    >
      {children}
    </Paper>
  )
}

type MetricCardProps = {
  label: string
  value: number
  icon: ReactNode
  color: string
}

function MetricCard({ label, value, icon, color }: MetricCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: 'background.paper',
      }}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: 2,
            display: 'grid',
            placeItems: 'center',
            bgcolor: color,
            color: 'common.white',
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 850, lineHeight: 1.1 }}>
            {value}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  )
}
