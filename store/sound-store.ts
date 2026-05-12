import { create } from 'zustand'

export type NavButtonKey = 'focus' | 'history' | 'analytics' | 'settings' | 'theme' | 'signOut'

interface SoundSettings {
  enabled: boolean
  volume: number
  alarmSound: string
  alarmVolume: number
  navSounds: Record<NavButtonKey, string>
  setEnabled: (enabled: boolean) => void
  setVolume: (volume: number) => void
  setAlarmSound: (sound: string) => void
  setAlarmVolume: (volume: number) => void
  setNavSound: (key: NavButtonKey, sound: string) => void
}

const DEFAULT_NAV_SOUNDS: Record<NavButtonKey, string> = {
  focus: 'click',
  history: 'click',
  analytics: 'click',
  settings: 'click',
  theme: 'click',
  signOut: 'click',
}

const STORAGE_KEY = 'sound-settings'

function getStored() {
  if (typeof window === 'undefined') return { enabled: true, volume: 0.8, alarmSound: 'success', alarmVolume: 1.0, navSounds: DEFAULT_NAV_SOUNDS }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return { enabled: true, volume: 0.8, alarmSound: 'success', alarmVolume: 1.0, ...parsed, navSounds: { ...DEFAULT_NAV_SOUNDS, ...parsed.navSounds } }
    }
  } catch {}
  return { enabled: true, volume: 0.8, alarmSound: 'success', alarmVolume: 1.0, navSounds: DEFAULT_NAV_SOUNDS }
}

function persist(partial: Partial<{ enabled: boolean; volume: number; alarmSound: string; alarmVolume: number; navSounds: Record<NavButtonKey, string> }>) {
  const current = getStored()
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...partial }))
}

export const useSoundSettings = create<SoundSettings>((set, get) => ({
  ...getStored(),
  setEnabled: (enabled) => { set({ enabled }); persist({ enabled }) },
  setVolume: (volume) => { set({ volume }); persist({ volume }) },
  setAlarmSound: (alarmSound) => { set({ alarmSound }); persist({ alarmSound }) },
  setAlarmVolume: (alarmVolume) => { set({ alarmVolume }); persist({ alarmVolume }) },
  setNavSound: (key, sound) => {
    const navSounds = { ...get().navSounds, [key]: sound }
    set({ navSounds })
    persist({ navSounds })
  },
}))
