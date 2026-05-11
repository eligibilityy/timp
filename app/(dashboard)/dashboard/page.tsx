'use client'

import { TimerDisplay } from '@/components/timer/timer-display'
import { TimerControls } from '@/components/timer/timer-controls'
import { TimerTicker } from '@/components/timer/timer-ticker'

export default function DashboardPage() {
  return (
    <div className="flex flex-col items-center gap-8 pt-8">
      <TimerTicker />
      <TimerDisplay />
      <TimerControls />
    </div>
  )
}
