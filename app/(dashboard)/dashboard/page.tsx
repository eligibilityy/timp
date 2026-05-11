'use client'

import { TimerDisplay } from '@/components/timer/timer-display'
import { TimerControls } from '@/components/timer/timer-controls'
import { TimerTicker } from '@/components/timer/timer-ticker'
import { SessionIntent } from '@/components/timer/session-intent'
import { ReflectionModal } from '@/components/session/reflection-modal'
import { useTimerStore } from '@/store/timer-store'

export default function DashboardPage() {
  const { status, sessionTitle, mode } = useTimerStore()

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
      <div className="flex flex-col items-center gap-6 w-full max-w-sm">
        {/* Session intent above timer when idle */}
        {status === 'idle' && <SessionIntent />}

        {/* Show session title when active */}
        {status !== 'idle' && sessionTitle && (
          <p className="text-sm text-muted-foreground">{sessionTitle}</p>
        )}

        <TimerTicker />
        <TimerDisplay />
        <TimerControls />
        <ReflectionModal />
      </div>
    </div>
  )
}
