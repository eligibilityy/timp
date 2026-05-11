'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useTimerStore } from '@/store/timer-store'
import { useSoundSettings } from '@/store/sound-store'
import { useNotificationSettings } from '@/store/notification-store'
import { defineSound, defineSequence } from '@web-kits/audio'
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
    // 3 bursts of 4 beeps: burst at 0s, 3s, 6s
    const steps = [
      { sound: play, at: 0 },
      { sound: play, at: 0.4 },
      { sound: play, at: 0.8 },
      { sound: play, at: 1.2 },
      { sound: play, at: 3.0 },
      { sound: play, at: 3.4 },
      { sound: play, at: 3.8 },
      { sound: play, at: 4.2 },
      { sound: play, at: 6.0 },
      { sound: play, at: 6.4 },
      { sound: play, at: 6.8 },
      { sound: play, at: 7.2 },
    ]
    defineSequence(steps)({ volume: alarmVolume })
  }, [alarmSound, alarmVolume])

  const playAlarmOnce = useCallback(() => {
    const def = ALARM_SOUNDS[alarmSound] ?? success
    defineSound(def)({ volume: alarmVolume })
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
  const prevSecondsRef = useRef(secondsRemaining)
  useEffect(() => {
    if (prevModeRef.current !== mode && prevStatusRef.current !== 'idle' && status !== 'idle') {
      // If previous seconds was low, it was a natural completion — full alarm
      // If high (user skipped), just play once
      if (prevSecondsRef.current <= 2) {
        playAlarm()
      } else {
        playAlarmOnce()
      }
      const label = mode === 'work' ? 'Break over — time to focus!' : 'Focus complete — take a break!'
      notify(label)
    }
    prevModeRef.current = mode
    prevStatusRef.current = status
    prevSecondsRef.current = secondsRemaining
  }, [mode, status, secondsRemaining, playAlarm, playAlarmOnce, notify])

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

  // Dynamic document title
  useEffect(() => {
    if (status === 'idle') {
      document.title = 'timp — focus timer'
      return
    }
    const mins = Math.floor(secondsRemaining / 60)
    const secs = secondsRemaining % 60
    const time = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    const modeLabel = mode === 'work' ? 'Focus' : mode === 'shortBreak' ? 'Break' : 'Long Break'
    document.title = `${time} — ${modeLabel} | timp`
  }, [secondsRemaining, status, mode])

  // Drift-correcting tick interval
  useEffect(() => {
    if (status !== 'running') return
    let expected = Date.now() + 1000
    const step = () => {
      const drift = Date.now() - expected
      tick()
      expected += 1000
      id = setTimeout(step, Math.max(0, 1000 - drift))
    }
    let id = setTimeout(step, 1000)
    return () => clearTimeout(id)
  }, [status, tick])

  // Sync timer when tab becomes visible again
  const syncTime = useTimerStore((s) => s.syncTime)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') syncTime()
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [syncTime])

  return toast ? (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="rounded-full bg-secondary shadow-lg px-4 py-2 text-sm font-medium">
        {toast}
      </div>
    </div>
  ) : null
}
