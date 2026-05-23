import { useState, type FormEvent } from 'react'
import {
  Button,
  FormControl,
  InputLabel,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
} from '@mui/material'
import FilterAltOffOutlinedIcon from '@mui/icons-material/FilterAltOffOutlined'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { clearFilters, fetchTasks, setFilters } from './tasksSlice'
import { priorityLabels, statusLabels, taskPriorities, taskStatuses } from './taskUtils'
import type { TaskPriority, TaskStatus } from './taskTypes'

export function TaskFiltersToolbar() {
  const dispatch = useAppDispatch()
  const filters = useAppSelector((state) => state.tasks.filters)
  const [search, setSearch] = useState(filters.search)

  function fetchFilteredTasks() {
    void dispatch(fetchTasks())
  }

  function applyFilters(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault()
    dispatch(setFilters({ search, pageNumber: 1 }))
    fetchFilteredTasks()
  }

  function updateFilter<Key extends keyof typeof filters>(key: Key, value: (typeof filters)[Key]) {
    dispatch(setFilters({ [key]: value, pageNumber: 1 }))
    fetchFilteredTasks()
  }

  function clearAllFilters() {
    setSearch('')
    dispatch(clearFilters())
    fetchFilteredTasks()
  }

  return (
    <Paper
      component="form"
      elevation={0}
      onSubmit={applyFilters}
      sx={{
        p: { xs: 1.5, md: 2 },
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: 'background.paper',
      }}
    >
      <Stack spacing={1.5}>
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} sx={{ alignItems: { lg: 'center' } }}>
          <TextField
            label="Search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            size="small"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ minWidth: { lg: 260 }, flexGrow: 1 }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={filters.status}
              onChange={(event) => updateFilter('status', event.target.value as TaskStatus | '')}
            >
              <MenuItem value="">All status</MenuItem>
              {taskStatuses.map((status) => (
                <MenuItem key={status} value={status}>
                  {statusLabels[status]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Priority</InputLabel>
            <Select
              label="Priority"
              value={filters.priority}
              onChange={(event) => updateFilter('priority', event.target.value as TaskPriority | '')}
            >
              <MenuItem value="">All priority</MenuItem>
              {taskPriorities.map((priority) => (
                <MenuItem key={priority} value={priority}>
                  {priorityLabels[priority]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Due from"
            type="date"
            size="small"
            value={filters.dueFrom}
            onChange={(event) => updateFilter('dueFrom', event.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label="Due to"
            type="date"
            size="small"
            value={filters.dueTo}
            onChange={(event) => updateFilter('dueTo', event.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <Stack direction="row" spacing={1}>
            <Button type="submit" variant="contained" startIcon={<SearchRoundedIcon />}>
              Apply
            </Button>
            <Button variant="outlined" startIcon={<FilterAltOffOutlinedIcon />} onClick={clearAllFilters}>
              Clear
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  )
}
