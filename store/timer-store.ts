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
  intervalStartedAt: number | null

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
  intervalStartedAt: null,

  start: () => {
    const { mode, settings } = get()
    set({
      status: 'running',
      secondsRemaining: getDuration(mode, settings),
      sessionStartedAt: get().sessionStartedAt || new Date().toISOString(),
      intervalStartedAt: Date.now(),
    })
  },

  pause: () => set({ status: 'paused', intervalStartedAt: null }),
  resume: () => set({ status: 'running', intervalStartedAt: Date.now() }),
  stop: () => set({ status: 'completed' }),

  skip: () => {
    const { mode, currentCycle, settings } = get()
    const nextMode = getNextMode(mode, currentCycle, settings)
    const nextCycle = mode !== 'work' ? currentCycle + 1 : currentCycle

    set({
      mode: nextMode,
      status: shouldAutoStart(nextMode, settings) ? 'running' : 'paused',
      secondsRemaining: getDuration(nextMode, settings),
      currentCycle: nextCycle,
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
    })
  },

  tick: () => {
    const { secondsRemaining, mode, currentCycle, settings } = get()

    if (secondsRemaining <= 1) {
      const nextMode = getNextMode(mode, currentCycle, settings)
      const nextCycle = mode !== 'work' ? currentCycle + 1 : currentCycle

      set({
        mode: nextMode,
        secondsRemaining: getDuration(nextMode, settings),
        currentCycle: nextCycle,
        status: shouldAutoStart(nextMode, settings) ? 'running' : 'paused',
      })
    } else {
      set({ secondsRemaining: secondsRemaining - 1 })
    }
  },

  setIntent: (title, tags) => set({ sessionTitle: title, sessionTags: tags }),

  syncTime: () => {
    const { status, intervalStartedAt, secondsRemaining, mode, currentCycle, settings } = get()
    if (status !== 'running' || !intervalStartedAt) return
    const elapsed = Math.floor((Date.now() - intervalStartedAt) / 1000)
    const corrected = Math.max(0, getDuration(mode, settings) - elapsed)
    if (corrected <= 0) {
      // Timer should have ended while backgrounded
      const nextMode = getNextMode(mode, currentCycle, settings)
      const nextCycle = mode !== 'work' ? currentCycle + 1 : currentCycle
      set({
        mode: nextMode,
        secondsRemaining: getDuration(nextMode, settings),
        currentCycle: nextCycle,
        status: shouldAutoStart(nextMode, settings) ? 'running' : 'paused',
        intervalStartedAt: shouldAutoStart(nextMode, settings) ? Date.now() : null,
      })
    } else if (Math.abs(corrected - secondsRemaining) > 2) {
      set({ secondsRemaining: corrected })
    }
  },

  updateSettings: (newSettings) => {
    const settings = { ...get().settings, ...newSettings }
    set({
      settings,
      secondsRemaining: get().status === 'idle' ? getDuration(get().mode, settings) : get().secondsRemaining,
    })
  },
}))
