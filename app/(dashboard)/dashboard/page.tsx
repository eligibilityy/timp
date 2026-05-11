'use client'

import { TimerDisplay } from '@/components/timer/timer-display'
import { TimerControls } from '@/components/timer/timer-controls'
import { TimerTicker } from '@/components/timer/timer-ticker'
import { SessionIntent } from '@/components/timer/session-intent'
import { ReflectionModal } from '@/components/session/reflection-modal'
import { useTimerStore } from '@/store/timer-store'

export default function DashboardPage() {
  const { status, sessionTitle } = useTimerStore()

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
      <div className="flex flex-col items-center gap-6">
        {/* Session title context when active */}
        {status !== 'idle' && status !== 'completed' && sessionTitle && (
          <p className="text-sm text-muted-foreground">{sessionTitle}</p>
        )}

        <TimerTicker />
        <TimerDisplay />

        {/* Start button (opens intent modal) when idle */}
        <SessionIntent />

        {/* Controls when running/paused */}
        <TimerControls />

        <ReflectionModal />
      </div>
    </div>
  )
}
