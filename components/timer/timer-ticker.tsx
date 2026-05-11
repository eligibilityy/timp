'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useTimerStore } from '@/store/timer-store'
import { useSoundSettings } from '@/store/sound-store'
import { useNotificationSettings } from '@/store/notification-store'
import { defineSound } from '@web-kits/audio'
import { success, notification, warning, error } from '@/.web-kits/crisp'
import type { SoundDefinition } from '@web-kits/audio'

const ALARM_SOUNDS: Record<string, SoundDefinition> = { success, notification, warning, error }

export function TimerTicker() {
  const status = useTimerStore((s) => s.status)
  const tick = useTimerStore((s) => s.tick)
  const secondsRemaining = useTimerStore((s) => s.secondsRemaining)
  const mode = useTimerStore((s) => s.mode)
  const settings = useTimerStore((s) => s.settings)
  const alarmSound = useSoundSettings((s) => s.alarmSound)
  const alarmVolume = useSoundSettings((s) => s.alarmVolume)
  const notifEnabled = useNotificationSettings((s) => s.enabled)
  const reminderMode = useNotificationSettings((s) => s.reminderMode)
  const reminderMinutes = useNotificationSettings((s) => s.reminderMinutes)
  const prevSecondsRef = useRef(secondsRemaining)
  const lastNotifRef = useRef(0)

  const playAlarm = useCallback(() => {
    const def = ALARM_SOUNDS[alarmSound] ?? success
    const play = defineSound(def)
    play({ volume: alarmVolume })
  }, [alarmSound, alarmVolume])

  // Timer completion alarm
  useEffect(() => {
    if (prevSecondsRef.current > 1 && secondsRemaining <= 1 && status === 'running') {
      playAlarm()
      if (notifEnabled && Notification.permission === 'granted') {
        new Notification('timp', { body: 'Timer complete! Time for a break.' })
      }
    }
    prevSecondsRef.current = secondsRemaining
  }, [secondsRemaining, status, playAlarm, notifEnabled])

  // Reminder notifications during focus
  useEffect(() => {
    if (status !== 'running' || mode !== 'work' || !notifEnabled) return
    if (Notification.permission !== 'granted') return

    const totalSeconds = settings.workDuration
    const reminderSeconds = reminderMinutes * 60

    if (reminderMode === 'last') {
      // Notify once when entering the last N minutes
      if (secondsRemaining === reminderSeconds && secondsRemaining < totalSeconds) {
        new Notification('timp', { body: `${reminderMinutes} minutes remaining in your focus session.` })
      }
    } else {
      // Notify every N minutes elapsed
      const elapsed = totalSeconds - secondsRemaining
      if (elapsed > 0 && elapsed % reminderSeconds === 0 && elapsed !== lastNotifRef.current) {
        lastNotifRef.current = elapsed
        new Notification('timp', { body: `${Math.round(elapsed / 60)} minutes of focus completed.` })
      }
    }
  }, [secondsRemaining, status, mode, notifEnabled, reminderMode, reminderMinutes, settings.workDuration])

  // Reset notification tracker when timer starts
  useEffect(() => {
    if (status === 'running') lastNotifRef.current = 0
  }, [status])

  useEffect(() => {
    if (status !== 'running') return
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [status, tick])

  return null
}
