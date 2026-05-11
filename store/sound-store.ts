import { create } from 'zustand'

interface SoundSettings {
  enabled: boolean
  volume: number
  setEnabled: (enabled: boolean) => void
  setVolume: (volume: number) => void
}

function getStored(): { enabled: boolean; volume: number } {
  if (typeof window === 'undefined') return { enabled: true, volume: 0.8 }
  try {
    const raw = localStorage.getItem('sound-settings')
    if (raw) return JSON.parse(raw)
  } catch {}
  return { enabled: true, volume: 0.8 }
}

export const useSoundSettings = create<SoundSettings>((set) => ({
  ...getStored(),
  setEnabled: (enabled) => {
    set({ enabled })
    localStorage.setItem('sound-settings', JSON.stringify({ ...getStored(), enabled }))
  },
  setVolume: (volume) => {
    set({ volume })
    localStorage.setItem('sound-settings', JSON.stringify({ ...getStored(), volume }))
  },
}))
