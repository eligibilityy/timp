import { create } from 'zustand'

export type TimerMode = 'work' | 'shortBreak' | 'longBreak'
export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed'

interface TimerSettings {
  workDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  cyclesBeforeLongBreak: number
  autoAdvance: boolean
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

  start: () => void
  pause: () => void
  resume: () => void
  skip: () => void
  stop: () => void
  reset: () => void
  tick: () => void
  setIntent: (title: string, tags: string[]) => void
  updateSettings: (settings: Partial<TimerSettings>) => void
}

const DEFAULT_SETTINGS: TimerSettings = {
  workDuration: 25 * 60,
  shortBreakDuration: 5 * 60,
  longBreakDuration: 15 * 60,
  cyclesBeforeLongBreak: 4,
  autoAdvance: true,
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
    // After every N work cycles, long break. Otherwise short break.
    return currentCycle % settings.cyclesBeforeLongBreak === 0 ? 'longBreak' : 'shortBreak'
  }
  // After any break, go back to work
  return 'work'
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

  start: () => {
    const { mode, settings } = get()
    set({
      status: 'running',
      secondsRemaining: getDuration(mode, settings),
      sessionStartedAt: get().sessionStartedAt || new Date().toISOString(),
    })
  },

  pause: () => set({ status: 'paused' }),
  resume: () => set({ status: 'running' }),

  // Stop ends the session immediately — triggers reflection
  stop: () => set({ status: 'completed' }),

  skip: () => {
    const { mode, currentCycle, settings } = get()
    const nextMode = getNextMode(mode, currentCycle, settings)
    const nextCycle = mode !== 'work' ? currentCycle + 1 : currentCycle

    set({
      mode: nextMode,
      status: settings.autoAdvance ? 'running' : 'paused',
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
      // Timer reached zero — advance to next interval (unlimited)
      const nextMode = getNextMode(mode, currentCycle, settings)
      const nextCycle = mode !== 'work' ? currentCycle + 1 : currentCycle

      set({
        mode: nextMode,
        secondsRemaining: getDuration(nextMode, settings),
        currentCycle: nextCycle,
        status: settings.autoAdvance ? 'running' : 'paused',
      })
    } else {
      set({ secondsRemaining: secondsRemaining - 1 })
    }
  },

  setIntent: (title, tags) => set({ sessionTitle: title, sessionTags: tags }),

  updateSettings: (newSettings) => {
    const settings = { ...get().settings, ...newSettings }
    set({
      settings,
      secondsRemaining: get().status === 'idle' ? getDuration(get().mode, settings) : get().secondsRemaining,
    })
  },
}))
