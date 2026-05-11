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

  const progress = 1 - secondsRemaining / getDuration(mode, settings)
  const radius = 120
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - progress)

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative flex items-center justify-center">
        <svg width="280" height="280" className="-rotate-90">
          <circle
            cx="140"
            cy="140"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-muted/30"
          />
          {status !== 'idle' && (
            <circle
              cx="140"
              cy="140"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className={cn('transition-all duration-1000', modeColors[mode])}
            />
          )}
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className={cn('text-5xl font-light tabular-nums tracking-tight', modeColors[mode])}>
            {time}
          </span>
          <span className="mt-1 text-sm text-muted-foreground">
            {modeLabels[mode]}
          </span>
        </div>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: settings.cyclesBeforeLongBreak }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'size-2 rounded-full',
              i < currentCycle - (mode === 'work' && status !== 'idle' ? 0 : 0)
                ? 'bg-foreground'
                : 'bg-muted'
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
