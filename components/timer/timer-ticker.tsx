'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
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
  const mode = useTimerStore((s) => s.mode)
  const secondsRemaining = useTimerStore((s) => s.secondsRemaining)
  const settings = useTimerStore((s) => s.settings)
  const alarmSound = useSoundSettings((s) => s.alarmSound)
  const alarmVolume = useSoundSettings((s) => s.alarmVolume)
  const notifEnabled = useNotificationSettings((s) => s.enabled)
  const reminderMode = useNotificationSettings((s) => s.reminderMode)
  const reminderMinutes = useNotificationSettings((s) => s.reminderMinutes)

  const prevModeRef = useRef(mode)
  const prevStatusRef = useRef(status)
  const lastNotifRef = useRef(0)
  const [toast, setToast] = useState<string | null>(null)

  const playAlarm = useCallback(() => {
    const def = ALARM_SOUNDS[alarmSound] ?? success
    const play = defineSound(def)
    play({ volume: alarmVolume })
  }, [alarmSound, alarmVolume])

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 4000)
  }, [])

  const notify = useCallback((body: string) => {
    showToast(body)
    if (notifEnabled && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification('timp', { body })
    }
  }, [notifEnabled, showToast])

  // Alarm on mode transition (timer completed or skipped)
  useEffect(() => {
    if (prevModeRef.current !== mode && prevStatusRef.current !== 'idle' && status !== 'idle') {
      playAlarm()
      const label = mode === 'work' ? 'Break over — time to focus!' : 'Focus complete — take a break!'
      notify(label)
    }
    prevModeRef.current = mode
    prevStatusRef.current = status
  }, [mode, status, playAlarm, notify])

  // Reminder notifications during focus
  useEffect(() => {
    if (status !== 'running' || mode !== 'work' || !notifEnabled) return

    const totalSeconds = settings.workDuration
    const reminderSeconds = reminderMinutes * 60

    if (reminderMode === 'last') {
      if (secondsRemaining === reminderSeconds && secondsRemaining < totalSeconds) {
        notify(`${reminderMinutes} minutes remaining.`)
      }
    } else {
      const elapsed = totalSeconds - secondsRemaining
      if (elapsed > 0 && elapsed % reminderSeconds === 0 && elapsed !== lastNotifRef.current) {
        lastNotifRef.current = elapsed
        notify(`${Math.round(elapsed / 60)} minutes of focus completed.`)
      }
    }
  }, [secondsRemaining, status, mode, notifEnabled, reminderMode, reminderMinutes, settings.workDuration, notify])

  // Reset notification tracker on new session
  useEffect(() => {
    if (status === 'running') lastNotifRef.current = 0
  }, [status])

  // Tick interval
  useEffect(() => {
    if (status !== 'running') return
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [status, tick])

  return toast ? (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="rounded-full bg-secondary shadow-lg px-4 py-2 text-sm font-medium">
        {toast}
      </div>
    </div>
  ) : null
}
