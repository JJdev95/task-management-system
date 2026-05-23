import { Box, Stack, Typography } from '@mui/material'

export function Logo() {
  return (
    <Stack direction="row" spacing={1.25} sx={{ minWidth: 0, alignItems: 'center' }}>
      <Box
        component="img"
        src="/taskforge-logo.svg"
        alt="TaskForge"
        sx={{ width: 38, height: 38, flexShrink: 0 }}
      />
      <Typography
        variant="h6"
        component="span"
        sx={{
          display: { xs: 'none', sm: 'block' },
          fontWeight: 800,
          letterSpacing: 0,
        }}
      >
        TaskForge
      </Typography>
    </Stack>
  )
}
