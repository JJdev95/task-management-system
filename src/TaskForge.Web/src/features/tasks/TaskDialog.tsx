import { useState, type FormEvent } from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import { createTask, deleteTask, updateTask } from './tasksSlice'
import { priorityLabels, statusLabels, taskPriorities, taskStatuses } from './taskUtils'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import type { TaskItem, TaskPriority, TaskStatus } from './taskTypes'

type TaskDialogProps = {
  open: boolean
  task: TaskItem | null
  onClose: () => void
  onSaved: () => void
}

export function TaskDialog({ open, task, onClose, onSaved }: TaskDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      {open && (
        <TaskDialogForm
          key={task?.id ?? 'new'}
          task={task}
          onClose={onClose}
          onSaved={onSaved}
        />
      )}
    </Dialog>
  )
}

type TaskDialogFormProps = Omit<TaskDialogProps, 'open'>

function TaskDialogForm({ task, onClose, onSaved }: TaskDialogFormProps) {
  const dispatch = useAppDispatch()
  const status = useAppSelector((state) => state.tasks.mutationStatus)
  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [taskStatus, setTaskStatus] = useState<TaskStatus>(task?.status ?? 'Todo')
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? 'Medium')
  const [dueDate, setDueDate] = useState(task?.dueDate ?? '')
  const [touched, setTouched] = useState(false)
  const titleRequired = touched && !title.trim()
  const isSaving = status === 'loading'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setTouched(true)

    if (!title.trim()) {
      return
    }

    const formValues = {
      title,
      description,
      priority,
      dueDate,
    }
    const action = task
      ? updateTask({
          ...task,
          ...formValues,
          status: taskStatus,
        })
      : createTask(formValues)

    const result = await dispatch(action)
    if (createTask.fulfilled.match(result) || updateTask.fulfilled.match(result)) {
      onSaved()
    }
  }

  async function handleDelete() {
    if (!task) {
      return
    }

    const result = await dispatch(deleteTask(task.id))
    if (deleteTask.fulfilled.match(result)) {
      onSaved()
    }
  }

  return (
    <>
      <DialogTitle>{task ? 'Edit task' : 'Add task'}</DialogTitle>
      <DialogContent>
        <Stack component="form" id="task-form" spacing={2.25} onSubmit={handleSubmit} sx={{ pt: 1 }}>
          <TextField
            label="Title"
            value={title}
            onBlur={() => setTouched(true)}
            onChange={(event) => setTitle(event.target.value)}
            error={titleRequired}
            helperText={titleRequired ? 'Title is required.' : ' '}
            autoFocus
            fullWidth
          />
          <TextField
            label="Description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            multiline
            minRows={3}
            fullWidth
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            {task && (
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  value={taskStatus}
                  onChange={(event) => setTaskStatus(event.target.value as TaskStatus)}
                >
                  {taskStatuses.map((statusOption) => (
                    <MenuItem key={statusOption} value={statusOption}>
                      {statusLabels[statusOption]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                label="Priority"
                value={priority}
                onChange={(event) => setPriority(event.target.value as TaskPriority)}
              >
                {taskPriorities.map((priorityOption) => (
                  <MenuItem key={priorityOption} value={priorityOption}>
                    {priorityLabels[priorityOption]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
          <TextField
            label="Due date"
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        {task && (
          <Button
            color="error"
            startIcon={<DeleteOutlineRoundedIcon />}
            onClick={handleDelete}
            disabled={isSaving}
            sx={{ mr: 'auto' }}
          >
            Delete
          </Button>
        )}
        <Button onClick={onClose}>Cancel</Button>
        <Button
          form="task-form"
          type="submit"
          variant="contained"
          startIcon={<SaveOutlinedIcon />}
          disabled={isSaving}
        >
          Save
        </Button>
      </DialogActions>
    </>
  )
}
