'use client'

import { useEffect, useRef } from 'react'
import { useTimerStore } from '@/store/timer-store'
import { useAppSounds } from '@/hooks/use-app-sounds'

export function TimerTicker() {
  const status = useTimerStore((s) => s.status)
  const tick = useTimerStore((s) => s.tick)
  const secondsRemaining = useTimerStore((s) => s.secondsRemaining)
  const { complete } = useAppSounds()
  const prevSecondsRef = useRef(secondsRemaining)

  // Play sound when timer hits zero (interval transition)
  useEffect(() => {
    if (prevSecondsRef.current > 1 && secondsRemaining <= 1 && status === 'running') {
      complete()
    }
    prevSecondsRef.current = secondsRemaining
  }, [secondsRemaining, status, complete])

  useEffect(() => {
    if (status !== 'running') return
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [status, tick])

  return null
}
