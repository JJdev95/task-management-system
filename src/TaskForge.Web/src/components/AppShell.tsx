import { useState, type ReactNode } from 'react'
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined'
import { useNavigate } from 'react-router-dom'
import { Logo } from './Logo'
import { logout } from '../features/auth/authSlice'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { selectCurrentUser } from '../features/auth/authSelectors'
import { selectThemeMode, toggleThemeMode } from '../features/preferences/preferencesSlice'

type AppShellProps = {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector(selectCurrentUser)
  const themeMode = useAppSelector(selectThemeMode)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const menuOpen = Boolean(anchorEl)

  const displayName = user?.email.split('@')[0] ?? 'TaskForge'
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="sticky"
        elevation={0}
        color="transparent"
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          backdropFilter: 'blur(18px)',
          bgcolor: 'background.paper',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ gap: 2, minHeight: 72 }}>
            <Logo />
            <Box sx={{ flexGrow: 1 }} />
            <Tooltip title={`Switch to ${themeMode === 'light' ? 'dark' : 'light'} mode`}>
              <IconButton color="inherit" onClick={() => dispatch(toggleThemeMode())}>
                {themeMode === 'light' ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
              </IconButton>
            </Tooltip>
            <Button
              color="inherit"
              onClick={(event) => setAnchorEl(event.currentTarget)}
              endIcon={<KeyboardArrowDownIcon />}
              sx={{
                px: { xs: 0.75, sm: 1.25 },
                textTransform: 'none',
                minWidth: 0,
              }}
            >
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Avatar sx={{ width: 34, height: 34, fontSize: 13 }}>{initials}</Avatar>
                <Typography
                  variant="body2"
                  sx={{ display: { xs: 'none', sm: 'block' }, maxWidth: 180 }}
                  noWrap
                >
                  {user?.email ?? displayName}
                </Typography>
              </Stack>
            </Button>
            <Menu anchorEl={anchorEl} open={menuOpen} onClose={() => setAnchorEl(null)}>
              <MenuItem
                onClick={() => {
                  setAnchorEl(null)
                  navigate('/reset-password')
                }}
              >
                <LockResetOutlinedIcon fontSize="small" sx={{ mr: 1 }} />
                Reset password
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setAnchorEl(null)
                  void dispatch(logout())
                }}
              >
                <LogoutOutlinedIcon fontSize="small" sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Toolbar>
        </Container>
      </AppBar>
      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
        {children}
      </Container>
    </Box>
  )
}
