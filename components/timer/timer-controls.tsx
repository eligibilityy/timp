'use client'

import { useTimerStore } from '@/store/timer-store'
import { Button } from '@/components/ui/button'
import { Pause, Play, SkipForward, Square } from 'lucide-react'
import { useAppSounds } from '@/hooks/use-app-sounds'

export function TimerControls() {
  const { status, pause, resume, skip, stop } = useTimerStore()
  const { click } = useAppSounds()

  if (status === 'idle' || status === 'completed') return null

  return (
    <div className="flex items-center gap-3">
      {status === 'running' && (
        <Button size="lg" variant="secondary" onClick={() => { click(); pause() }}>
          <Pause className="mr-2 size-4" />
          Pause
        </Button>
      )}
      {status === 'paused' && (
        <Button size="lg" onClick={() => { click(); resume() }}>
          <Play className="mr-2 size-4" />
          Resume
        </Button>
      )}
      <Button size="lg" variant="ghost" onClick={() => { click(); skip() }}>
        <SkipForward className="size-4" />
      </Button>
      <Button size="lg" variant="destructive" onClick={() => { click(); stop() }}>
        <Square className="mr-2 size-3.5" />
        Stop
      </Button>
    </div>
  )
}
