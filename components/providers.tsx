'use client'

import { useEffect } from 'react'
import { ThemeProvider } from '@/components/theme-provider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { SoundProvider } from '@web-kits/audio/react'
import { useSoundSettings } from '@/store/sound-store'
import { hydrateTimerSettings } from '@/store/timer-store'
import { Toaster } from '@/components/ui/sonner'

export function Providers({ children }: { children: React.ReactNode }) {
  const { enabled, volume, setEnabled, setVolume } = useSoundSettings()

  useEffect(() => {
    hydrateTimerSettings()
  }, [])

  return (
    <ThemeProvider>
      <SoundProvider
        enabled={enabled}
        volume={volume}
        onEnabledChange={setEnabled}
        onVolumeChange={setVolume}
      >
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster />
      </SoundProvider>
    </ThemeProvider>
  )
}
