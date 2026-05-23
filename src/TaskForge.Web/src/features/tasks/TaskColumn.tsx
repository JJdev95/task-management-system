import { useDroppable } from '@dnd-kit/core'
import { Box, Chip, Paper, Stack, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import type { TaskStatus } from './taskTypes'

type TaskColumnProps = {
  id: TaskStatus
  title: string
  count: number
  accentColor: string
  expanded?: boolean
  children: ReactNode
}

export function TaskColumn({ id, title, count, accentColor, expanded = false, children }: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <Paper
      ref={setNodeRef}
      elevation={0}
      sx={{
        p: 1.5,
        border: 1,
        borderColor: isOver ? 'primary.main' : 'divider',
        bgcolor: isOver ? 'action.hover' : 'background.default',
        borderRadius: 2,
        minHeight: { xs: 180, md: 420 },
        boxShadow: isOver ? 3 : 0,
        transition: 'border-color 160ms ease, box-shadow 160ms ease, background-color 160ms ease',
      }}
    >
      <Stack spacing={1.5}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: accentColor }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              {title}
            </Typography>
          </Stack>
          <Chip label={count} size="small" />
        </Stack>
        <Box
          sx={{
            display: 'grid',
            gap: 1.25,
            gridTemplateColumns: expanded
              ? {
                  xs: '1fr',
                  sm: 'repeat(2, minmax(0, 1fr))',
                  lg: 'repeat(3, minmax(0, 1fr))',
                  xl: 'repeat(4, minmax(0, 1fr))',
                }
              : '1fr',
          }}
        >
          {children}
        </Box>
      </Stack>
    </Paper>
  )
}
