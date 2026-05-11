'use client'

import { useTimerStore } from '@/store/timer-store'
import { Button } from '@/components/ui/button'
import { Play, Pause, SkipForward, RotateCcw } from 'lucide-react'

export function TimerControls() {
  const { status, start, pause, resume, skip, reset } = useTimerStore()

  return (
    <div className="flex items-center gap-3">
      {status === 'idle' && (
        <Button size="lg" onClick={start}>
          <Play className="mr-2 size-4" />
          Start
        </Button>
      )}
      {status === 'running' && (
        <Button size="lg" variant="secondary" onClick={pause}>
          <Pause className="mr-2 size-4" />
          Pause
        </Button>
      )}
      {status === 'paused' && (
        <Button size="lg" onClick={resume}>
          <Play className="mr-2 size-4" />
          Resume
        </Button>
      )}
      {status !== 'idle' && status !== 'completed' && (
        <>
          <Button size="lg" variant="ghost" onClick={skip}>
            <SkipForward className="size-4" />
          </Button>
          <Button size="lg" variant="ghost" onClick={reset}>
            <RotateCcw className="size-4" />
          </Button>
        </>
      )}
    </div>
  )
}
