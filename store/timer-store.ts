import { create } from 'zustand'

export type TimerMode = 'work' | 'shortBreak' | 'longBreak'
export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed'

interface TimerSettings {
  workDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  cyclesBeforeLongBreak: number
  autoStartBreaks: boolean
  autoStartTimers: boolean
}

interface TimerState {
  mode: TimerMode
  status: TimerStatus
  secondsRemaining: number
  currentCycle: number
  sessionStartedAt: string | null
  sessionTitle: string
  sessionTags: string[]
  settings: TimerSettings
  endsAt: number | null

  start: () => void
  pause: () => void
  resume: () => void
  skip: () => void
  stop: () => void
  reset: () => void
  tick: () => void
  syncTime: () => void
  setIntent: (title: string, tags: string[]) => void
  updateSettings: (settings: Partial<TimerSettings>) => void
}

const DEFAULT_SETTINGS: TimerSettings = {
  workDuration: 25 * 60,
  shortBreakDuration: 5 * 60,
  longBreakDuration: 15 * 60,
  cyclesBeforeLongBreak: 4,
  autoStartBreaks: true,
  autoStartTimers: true,
}

const STORAGE_KEY = 'timer-settings'

function getStoredSettings(): TimerSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch {}
  return DEFAULT_SETTINGS
}

function getDuration(mode: TimerMode, settings: TimerSettings): number {
  switch (mode) {
    case 'work': return settings.workDuration
    case 'shortBreak': return settings.shortBreakDuration
    case 'longBreak': return settings.longBreakDuration
  }
}

function getNextMode(mode: TimerMode, currentCycle: number, settings: TimerSettings): TimerMode {
  if (mode === 'work') {
    return currentCycle % settings.cyclesBeforeLongBreak === 0 ? 'longBreak' : 'shortBreak'
  }
  return 'work'
}

function shouldAutoStart(nextMode: TimerMode, settings: TimerSettings): boolean {
  return nextMode === 'work' ? settings.autoStartTimers : settings.autoStartBreaks
}

export const useTimerStore = create<TimerState>((set, get) => ({
  mode: 'work',
  status: 'idle',
  secondsRemaining: DEFAULT_SETTINGS.workDuration,
  currentCycle: 1,
  sessionStartedAt: null,
  sessionTitle: '',
  sessionTags: [],
  settings: DEFAULT_SETTINGS,
  endsAt: null,

  start: () => {
    const { mode, settings } = get()
    const duration = getDuration(mode, settings)
    set({
      status: 'running',
      secondsRemaining: duration,
      sessionStartedAt: get().sessionStartedAt || new Date().toISOString(),
      endsAt: Date.now() + duration * 1000,
    })
  },

  pause: () => {
    const { endsAt } = get()
    const remaining = endsAt ? Math.max(0, Math.round((endsAt - Date.now()) / 1000)) : get().secondsRemaining
    set({ status: 'paused', endsAt: null, secondsRemaining: remaining })
  },

  resume: () => {
    const { secondsRemaining } = get()
    set({ status: 'running', endsAt: Date.now() + secondsRemaining * 1000 })
  },

  stop: () => set({ status: 'completed', endsAt: null }),

  skip: () => {
    const { mode, currentCycle, settings } = get()
    const nextMode = getNextMode(mode, currentCycle, settings)
    const nextCycle = mode !== 'work' ? currentCycle + 1 : currentCycle
    const autoStart = shouldAutoStart(nextMode, settings)
    const nextDuration = getDuration(nextMode, settings)

    set({
      mode: nextMode,
      status: autoStart ? 'running' : 'paused',
      secondsRemaining: nextDuration,
      currentCycle: nextCycle,
      endsAt: autoStart ? Date.now() + nextDuration * 1000 : null,
    })
  },

  reset: () => {
    const { settings } = get()
    set({
      mode: 'work',
      status: 'idle',
      secondsRemaining: settings.workDuration,
      currentCycle: 1,
      sessionStartedAt: null,
      sessionTitle: '',
      sessionTags: [],
      endsAt: null,
    })
  },

  tick: () => {
    const { endsAt, mode, currentCycle, settings } = get()
    if (!endsAt) return

    const remaining = Math.round((endsAt - Date.now()) / 1000)

    if (remaining <= 0) {
      const nextMode = getNextMode(mode, currentCycle, settings)
      const nextCycle = mode !== 'work' ? currentCycle + 1 : currentCycle
      const autoStart = shouldAutoStart(nextMode, settings)
      const nextDuration = getDuration(nextMode, settings)

      set({
        mode: nextMode,
        secondsRemaining: nextDuration,
        currentCycle: nextCycle,
        status: autoStart ? 'running' : 'paused',
        endsAt: autoStart ? Date.now() + nextDuration * 1000 : null,
      })
    } else {
      set({ secondsRemaining: remaining })
    }
  },

  syncTime: () => {
    const { status, endsAt } = get()
    if (status !== 'running' || !endsAt) return
    // Just call tick — it derives everything from endsAt
    get().tick()
  },

  setIntent: (title, tags) => set({ sessionTitle: title, sessionTags: tags }),

  updateSettings: (newSettings) => {
    const settings = { ...get().settings, ...newSettings }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    set({
      settings,
      secondsRemaining: get().status === 'idle' ? getDuration(get().mode, settings) : get().secondsRemaining,
    })
  },
}))

// Hydrate settings from localStorage after React hydration
export function hydrateTimerSettings() {
  const stored = getStoredSettings()
  const state = useTimerStore.getState()
  if (state.status === 'idle') {
    useTimerStore.setState({
      settings: stored,
      secondsRemaining: getDuration(state.mode, stored),
    })
  } else {
    useTimerStore.setState({ settings: stored })
  }
}
