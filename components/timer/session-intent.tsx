'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { TagSelector } from '@/components/session/tag-selector'
import { useTimerStore } from '@/store/timer-store'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>New session</DialogTitle>
            <DialogDescription>What are you working on?</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="e.g. Building onboarding UI"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleBegin()}
              autoFocus
            />
            <TagSelector selected={tagIds} onChange={setTagIds} />
            <div className="flex flex-col gap-2 pt-2">
              <Button onClick={handleBegin} className="w-full">
                Begin
              </Button>
              <button
                onClick={handleBegin}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Start without title
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
