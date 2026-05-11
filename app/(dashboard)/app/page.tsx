'use client'

import { motion, AnimatePresence } from 'motion/react'
import { TimerDisplay } from '@/components/timer/timer-display'
import { TimerControls } from '@/components/timer/timer-controls'
import { TimerTicker } from '@/components/timer/timer-ticker'
import { SessionIntent } from '@/components/timer/session-intent'
import { ReflectionModal } from '@/components/session/reflection-modal'
import { useTimerStore } from '@/store/timer-store'
import { useAutoHide } from '@/hooks/use-auto-hide'

export default function DashboardPage() {
  const { status, sessionTitle } = useTimerStore()
  const uiVisible = useAutoHide(status === 'running')

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
      <motion.div
        layout
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-6"
      >
        <AnimatePresence>
          {status !== 'idle' && status !== 'completed' && sessionTitle && uiVisible && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-muted-foreground"
            >
              {sessionTitle}
            </motion.p>
          )}
        </AnimatePresence>

        <TimerTicker />
        <TimerDisplay />
        <SessionIntent />

        <AnimatePresence>
          {(status === 'running' || status === 'paused') && uiVisible && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <TimerControls />
            </motion.div>
          )}
        </AnimatePresence>

        <ReflectionModal />
      </motion.div>
    </div>
  )
}
