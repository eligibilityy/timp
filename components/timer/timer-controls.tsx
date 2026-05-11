'use client'

import { useTimerStore } from '@/store/timer-store'
import { SoundButton } from '@/components/ui/sound-button'
import { Pause, Play, SkipForward, Square } from 'lucide-react'

export function TimerControls() {
  const { status, pause, resume, skip, stop } = useTimerStore()

  return (
    <div className="flex items-center gap-3 h-10">
      {(status === 'running' || status === 'paused') && (
        <>
          {status === 'running' && (
            <SoundButton size="lg" variant="secondary" onClick={pause}>
              <Pause className="mr-2 size-4" />
              Pause
            </SoundButton>
          )}
          {status === 'paused' && (
            <SoundButton size="lg" onClick={resume}>
              <Play className="mr-2 size-4" />
              Resume
            </SoundButton>
          )}
          <SoundButton size="lg" variant="ghost" onClick={skip}>
            <SkipForward className="size-4" />
          </SoundButton>
          <SoundButton size="lg" variant="destructive" onClick={stop}>
            <Square className="mr-2 size-3.5" />
            Stop
          </SoundButton>
        </>
      )}
    </div>
  )
}
