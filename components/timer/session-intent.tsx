'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { TagSelector } from '@/components/session/tag-selector'
import { useTimerStore } from '@/store/timer-store'

export function SessionIntent() {
  const { status, setIntent, start } = useTimerStore()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [tagIds, setTagIds] = useState<string[]>([])

  if (status !== 'idle') return null

  const handleBegin = () => {
    setIntent(title, tagIds)
    start()
    setOpen(false)
    setTitle('')
    setTagIds([])
  }

  return (
    <>
      <Button size="lg" onClick={() => setOpen(true)}>
        Start Focus
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xl bg-background/80">
          <div className="flex flex-col items-center gap-6 w-full max-w-sm px-6">
            <h2 className="text-xl font-medium">What are you working on?</h2>
            <input
              type="text"
              placeholder="e.g. Building onboarding UI"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleBegin()}
              autoFocus
              className="w-full bg-transparent border-b border-border/50 pb-2 text-center text-lg outline-none placeholder:text-muted-foreground/50 focus:border-foreground/30 transition-colors"
            />
            <TagSelector selected={tagIds} onChange={setTagIds} />
            <div className="flex flex-col items-center gap-3 w-full pt-2">
              <Button onClick={handleBegin} size="lg" className="w-full">
                Begin
              </Button>
              <button
                onClick={() => setOpen(false)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
