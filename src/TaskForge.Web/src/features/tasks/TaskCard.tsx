import { useDraggable } from '@dnd-kit/core'
import {
  Box,
  Card,
  CardActionArea,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded'
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded'
import DragIndicatorRoundedIcon from '@mui/icons-material/DragIndicatorRounded'
import EventOutlinedIcon from '@mui/icons-material/EventOutlined'
import { CSS } from '@dnd-kit/utilities'
import { format, parseISO } from 'date-fns'
import { useAppDispatch } from '../../app/hooks'
import { updateTask } from './tasksSlice'
import {
  decreasePriority,
  increasePriority,
  priorityAccentColors,
  priorityColors,
  priorityLabels,
} from './taskUtils'
import type { TaskItem } from './taskTypes'

type TaskCardProps = {
  task: TaskItem
  onEdit: (task: TaskItem) => void
}

export function TaskCard({ task, onEdit }: TaskCardProps) {
  const dispatch = useAppDispatch()
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  })

  const nextPriority = increasePriority(task.priority)
  const previousPriority = decreasePriority(task.priority)
  const dueLabel = task.dueDate ? format(parseISO(task.dueDate), 'MMM d') : 'No due date'
  const isCompleted = task.status === 'Completed'
  const accentColor = task.urgency.kind === 'overdue' ? 'error.main' : priorityAccentColors[task.priority]
  const borderColor =
    task.urgency.kind === 'overdue'
      ? 'error.main'
      : task.priority === 'Critical'
        ? priorityAccentColors.Critical
        : 'divider'

  const style = {
    transform: CSS.Translate.toString(transform),
  }

  function handlePriorityChange(priority: TaskItem['priority']) {
    void dispatch(updateTask({ ...task, priority }))
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      variant="outlined"
      sx={{
        opacity: isDragging ? 0.65 : 1,
        borderRadius: 2,
        overflow: 'hidden',
        borderColor,
        bgcolor: 'background.paper',
        transition: 'border-color 160ms ease, transform 160ms ease, box-shadow 160ms ease',
        '&:hover': {
          boxShadow: 4,
          transform: 'translateY(-1px)',
        },
      }}
    >
      <Box
        sx={{
          height: 4,
          bgcolor: accentColor,
        }}
      />
      <CardActionArea
        onClick={isCompleted ? undefined : () => onEdit(task)}
        sx={{
          p: 2,
          alignItems: 'stretch',
          cursor: isCompleted ? 'default' : 'pointer',
        }}
      >
        <Stack spacing={1.4}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
            <Box
              {...listeners}
              {...attributes}
              onClick={(event) => event.stopPropagation()}
              sx={{
                color: 'text.secondary',
                cursor: isDragging ? 'grabbing' : 'grab',
                display: 'grid',
                placeItems: 'center',
                width: 44,
                height: 44,
                mt: -1,
                ml: -1,
                borderRadius: 1.5,
                touchAction: 'none',
                flexShrink: 0,
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <DragIndicatorRoundedIcon fontSize="small" />
            </Box>
            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
              <Typography
                variant="subtitle1"
                title={task.title}
                sx={{
                  fontWeight: 850,
                  lineHeight: 1.25,
                  overflowWrap: 'anywhere',
                }}
              >
                {task.title}
              </Typography>
              {task.description && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 0.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {task.description}
                </Typography>
              )}
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
            <Chip
              size="small"
              color={priorityColors[task.priority]}
              label={priorityLabels[task.priority]}
              variant={task.priority === 'Low' ? 'outlined' : 'filled'}
            />
            {task.urgency.label && (
              <Chip
                size="small"
                color={task.urgency.kind === 'overdue' ? 'error' : 'warning'}
                label={task.urgency.label}
              />
            )}
          </Stack>

          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', color: 'text.secondary' }}>
              <EventOutlinedIcon fontSize="small" />
              <Typography variant="caption">{dueLabel}</Typography>
            </Stack>
            <Stack direction="row" spacing={0.5} onClick={(event) => event.stopPropagation()}>
              <Tooltip title="Lower priority">
                <span>
                  <IconButton
                    size="small"
                    disabled={isCompleted || !previousPriority}
                    onClick={() => previousPriority && handlePriorityChange(previousPriority)}
                  >
                    <ArrowDownwardRoundedIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Raise priority">
                <span>
                  <IconButton
                    size="small"
                    disabled={isCompleted || !nextPriority}
                    onClick={() => nextPriority && handlePriorityChange(nextPriority)}
                  >
                    <ArrowUpwardRoundedIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          </Stack>
        </Stack>
      </CardActionArea>
    </Card>
  )
}
