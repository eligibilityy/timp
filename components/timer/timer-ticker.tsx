'use client'

import { useEffect } from 'react'
import { useTimerStore } from '@/store/timer-store'

export function TimerTicker() {
  const status = useTimerStore((s) => s.status)
  const tick = useTimerStore((s) => s.tick)

  useEffect(() => {
    if (status !== 'running') return
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [status, tick])

  return null
}
