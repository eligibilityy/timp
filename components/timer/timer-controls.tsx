'use client'

import { useEffect, useState, useRef } from 'react'
import { useTimerStore } from '@/store/timer-store'
import { Button } from '@/components/ui/button'
import { Pause, Play, SkipForward, Square } from 'lucide-react'
import { cn } from '@/lib/utils'

export function TimerControls() {
  const { status, pause, resume, skip, stop } = useTimerStore()
  const [visible, setVisible] = useState(true)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (status !== 'running') {
      setVisible(true)
      return
    }

    // Hide after 3s of no movement when running
    const hide = () => {
      timeoutRef.current = setTimeout(() => setVisible(false), 3000)
    }

    const show = () => {
      setVisible(true)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      hide()
    }

    hide()
    window.addEventListener('mousemove', show)
    window.addEventListener('touchstart', show)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      window.removeEventListener('mousemove', show)
      window.removeEventListener('touchstart', show)
    }
  }, [status])

  if (status === 'idle' || status === 'completed') return null

  return (
    <div className={cn(
      'flex items-center gap-3 transition-opacity duration-300',
      visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
    )}>
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
      <Button size="lg" variant="ghost" onClick={skip}>
        <SkipForward className="size-4" />
      </Button>
      <Button size="lg" variant="destructive" onClick={stop}>
        <Square className="mr-2 size-3.5" />
        Stop
      </Button>
    </div>
  )
}
