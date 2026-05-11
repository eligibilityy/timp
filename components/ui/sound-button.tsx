'use client'

import { forwardRef } from 'react'
import { Button } from '@/components/ui/button'
import { useSound } from '@web-kits/audio/react'
import { click as defaultSound } from '@/.web-kits/crisp'
import type { SoundDefinition } from '@web-kits/audio'

type ButtonProps = React.ComponentProps<typeof Button>

interface SoundButtonProps extends ButtonProps {
  sound?: SoundDefinition
}

export const SoundButton = forwardRef<HTMLButtonElement, SoundButtonProps>(
  ({ onClick, sound = defaultSound, ...props }, ref) => {
    const playSound = useSound(sound)

    return (
      <Button
        ref={ref}
        onClick={(e) => {
          playSound()
          onClick?.(e)
        }}
        {...props}
      />
    )
  }
)
SoundButton.displayName = 'SoundButton'
