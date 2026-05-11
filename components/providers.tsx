'use client'

import { ThemeProvider } from '@/components/theme-provider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { SoundProvider } from '@web-kits/audio/react'
import { useSoundSettings } from '@/store/sound-store'

export function Providers({ children }: { children: React.ReactNode }) {
  const { enabled, volume, setEnabled, setVolume } = useSoundSettings()

  return (
    <ThemeProvider>
      <SoundProvider
        enabled={enabled}
        volume={volume}
        onEnabledChange={setEnabled}
        onVolumeChange={setVolume}
      >
        <TooltipProvider>{children}</TooltipProvider>
      </SoundProvider>
    </ThemeProvider>
  )
}
