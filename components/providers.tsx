'use client'

import { ThemeProvider } from '@/components/theme-provider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { SoundProvider } from '@web-kits/audio/react'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SoundProvider enabled={true} volume={0.8}>
        <TooltipProvider>{children}</TooltipProvider>
      </SoundProvider>
    </ThemeProvider>
  )
}
