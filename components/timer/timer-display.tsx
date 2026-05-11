'use client'

import { useTimerStore, type TimerMode } from '@/store/timer-store'
import { cn } from '@/lib/utils'

const modeLabels: Record<TimerMode, string> = {
  work: 'Focus',
  shortBreak: 'Short Break',
  longBreak: 'Long Break',
}

const modeColors: Record<TimerMode, string> = {
  work: 'text-foreground',
  shortBreak: 'text-emerald-500',
  longBreak: 'text-blue-500',
}

export function TimerDisplay() {
  const { secondsRemaining, mode, currentCycle, settings, status } = useTimerStore()

  const minutes = Math.floor(secondsRemaining / 60)
  const seconds = secondsRemaining % 60
  const time = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`

  const total = getDuration(mode, settings)
  const progress = total > 0 ? 1 - secondsRemaining / total : 0
  const radius = 120
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - progress)

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative flex items-center justify-center">
        <svg width="280" height="280" className="-rotate-90">
          <circle
            cx="140" cy="140" r={radius}
            fill="none" stroke="currentColor" strokeWidth="4"
            className="text-muted/30"
          />
          {status !== 'idle' && (
            <circle
              cx="140" cy="140" r={radius}
              fill="none" stroke="currentColor" strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className={cn('transition-[stroke-dashoffset] duration-1000 ease-linear', modeColors[mode])}
            />
          )}
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className={cn('text-5xl font-light tabular-nums tracking-tight transition-colors', modeColors[mode])}>
            {time}
          </span>
          <span className="mt-1 text-sm text-muted-foreground transition-all">
            {modeLabels[mode]}
          </span>
        </div>
      </div>
      <div className="flex gap-1.5">
        {Array.from({ length: settings.cyclesBeforeLongBreak }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'size-2 rounded-full transition-colors',
              i < currentCycle - 1 ? 'bg-foreground' :
              i === currentCycle - 1 && mode === 'work' && status !== 'idle' ? 'bg-foreground/50' :
              'bg-muted'
            )}
          />
        ))}
      </div>
    </div>
  )
}

function getDuration(mode: TimerMode, settings: { workDuration: number; shortBreakDuration: number; longBreakDuration: number }) {
  switch (mode) {
    case 'work': return settings.workDuration
    case 'shortBreak': return settings.shortBreakDuration
    case 'longBreak': return settings.longBreakDuration
  }
}
