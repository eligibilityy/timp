import { create } from 'zustand'

interface SoundSettings {
  enabled: boolean
  volume: number
  alarmSound: string
  alarmVolume: number
  setEnabled: (enabled: boolean) => void
  setVolume: (volume: number) => void
  setAlarmSound: (sound: string) => void
  setAlarmVolume: (volume: number) => void
}

const STORAGE_KEY = 'sound-settings'

function getStored() {
  if (typeof window === 'undefined') return { enabled: true, volume: 0.8, alarmSound: 'success', alarmVolume: 1.0 }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { enabled: true, volume: 0.8, alarmSound: 'success', alarmVolume: 1.0, ...JSON.parse(raw) }
  } catch {}
  return { enabled: true, volume: 0.8, alarmSound: 'success', alarmVolume: 1.0 }
}

function persist(partial: Partial<{ enabled: boolean; volume: number; alarmSound: string; alarmVolume: number }>) {
  const current = getStored()
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...partial }))
}

export const useSoundSettings = create<SoundSettings>((set) => ({
  ...getStored(),
  setEnabled: (enabled) => { set({ enabled }); persist({ enabled }) },
  setVolume: (volume) => { set({ volume }); persist({ volume }) },
  setAlarmSound: (alarmSound) => { set({ alarmSound }); persist({ alarmSound }) },
  setAlarmVolume: (alarmVolume) => { set({ alarmVolume }); persist({ alarmVolume }) },
}))
