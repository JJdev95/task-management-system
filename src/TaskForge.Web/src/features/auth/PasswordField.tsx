import { useState, type MouseEvent } from 'react'
import { IconButton, InputAdornment, TextField, type TextFieldProps } from '@mui/material'
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'

type PasswordFieldProps = Omit<TextFieldProps, 'type' | 'slotProps'> & {
  revealLabel?: string
}

export function PasswordField({ revealLabel, ...props }: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false)
  const labelText = revealLabel ?? String(props.label ?? 'password')

  function handleMouseDown(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
  }

  return (
    <TextField
      {...props}
      type={isVisible ? 'text' : 'password'}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label={`${isVisible ? 'Hide' : 'Show'} ${labelText}`}
                edge="end"
                onClick={() => setIsVisible((current) => !current)}
                onMouseDown={handleMouseDown}
              >
                {isVisible ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  )
}
