import { create } from 'zustand'
import { toast } from 'sonner'

interface NotificationSettings {
  enabled: boolean
  reminderMode: 'every' | 'last'
  reminderMinutes: number
  setEnabled: (enabled: boolean) => void
  setReminderMode: (mode: 'every' | 'last') => void
  setReminderMinutes: (minutes: number) => void
}

const STORAGE_KEY = 'notification-settings'

function getStored() {
  if (typeof window === 'undefined') return { enabled: false, reminderMode: 'last' as const, reminderMinutes: 5 }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { enabled: false, reminderMode: 'last' as const, reminderMinutes: 5, ...JSON.parse(raw) }
  } catch {}
  return { enabled: false, reminderMode: 'last' as const, reminderMinutes: 5 }
}

function persist(partial: Partial<{ enabled: boolean; reminderMode: string; reminderMinutes: number }>) {
  const current = getStored()
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...partial }))
}

async function requestPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  const result = await Notification.requestPermission()
  return result === 'granted'
}

export const useNotificationSettings = create<NotificationSettings>((set) => ({
  ...getStored(),
  setEnabled: async (enabled) => {
    if (enabled) {
      const granted = await requestPermission()
      if (!granted) {
        toast('Notification permission denied. Check your browser settings.')
        return
      }
    }
    set({ enabled })
    persist({ enabled })
  },
  setReminderMode: (reminderMode) => { set({ reminderMode }); persist({ reminderMode }) },
  setReminderMinutes: (reminderMinutes) => { set({ reminderMinutes }); persist({ reminderMinutes }) },
}))
