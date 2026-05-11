'use client'

import { forwardRef } from 'react'
import { Button } from '@/components/ui/button'
import { useAppSounds } from '@/hooks/use-app-sounds'

type ButtonProps = React.ComponentProps<typeof Button>

export const SoundButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ onClick, onMouseEnter, ...props }, ref) => {
    const { click, hover } = useAppSounds()

    return (
      <Button
        ref={ref}
        onClick={(e) => {
          click()
          onClick?.(e)
        }}
        onMouseEnter={(e) => {
          hover()
          onMouseEnter?.(e)
        }}
        {...props}
      />
    )
  }
)
SoundButton.displayName = 'SoundButton'
