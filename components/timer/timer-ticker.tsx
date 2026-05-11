'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useTimerStore } from '@/store/timer-store'
import { useSoundSettings } from '@/store/sound-store'
import { defineSound } from '@web-kits/audio'
import { success, notification, warning, error } from '@/.web-kits/crisp'
import type { SoundDefinition } from '@web-kits/audio'

const ALARM_SOUNDS: Record<string, SoundDefinition> = { success, notification, warning, error }

export function TimerTicker() {
  const status = useTimerStore((s) => s.status)
  const tick = useTimerStore((s) => s.tick)
  const secondsRemaining = useTimerStore((s) => s.secondsRemaining)
  const alarmSound = useSoundSettings((s) => s.alarmSound)
  const alarmVolume = useSoundSettings((s) => s.alarmVolume)
  const prevSecondsRef = useRef(secondsRemaining)

  const playAlarm = useCallback(() => {
    const def = ALARM_SOUNDS[alarmSound] ?? success
    const play = defineSound(def)
    play({ volume: alarmVolume })
  }, [alarmSound, alarmVolume])

  useEffect(() => {
    if (prevSecondsRef.current > 1 && secondsRemaining <= 1 && status === 'running') {
      playAlarm()
    }
    prevSecondsRef.current = secondsRemaining
  }, [secondsRemaining, status, playAlarm])

  useEffect(() => {
    if (status !== 'running') return
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [status, tick])

  return null
}
