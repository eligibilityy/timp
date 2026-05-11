'use client'

import { TimerDisplay } from '@/components/timer/timer-display'
import { TimerControls } from '@/components/timer/timer-controls'
import { TimerTicker } from '@/components/timer/timer-ticker'
import { SessionIntent } from '@/components/timer/session-intent'
import { ReflectionModal } from '@/components/session/reflection-modal'
import { DashboardHeatmap } from '@/components/heatmap/dashboard-heatmap'

export default function DashboardPage() {
  return (
    <div className="flex flex-col items-center gap-8 pt-8">
      <TimerTicker />
      <TimerDisplay />
      <SessionIntent />
      <TimerControls />
      <ReflectionModal />
      <div className="w-full pt-8">
        <h2 className="mb-4 text-sm font-medium text-muted-foreground">Focus activity</h2>
        <DashboardHeatmap />
      </div>
    </div>
  )
}
