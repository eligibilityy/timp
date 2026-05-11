'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { TagSelector } from '@/components/session/tag-selector'
import { useTimerStore } from '@/store/timer-store'

export function SessionIntent() {
  const { setIntent, start } = useTimerStore()
  const [title, setTitle] = useState('')
  const [tagIds, setTagIds] = useState<string[]>([])

  const handleStart = () => {
    setIntent(title, tagIds)
    start()
  }

  return (
    <div className="w-full space-y-4 text-center">
      <p className="text-lg font-medium">What are you working on?</p>
      <Input
        placeholder="e.g. Building onboarding UI"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleStart()}
        className="text-center"
      />
      <TagSelector selected={tagIds} onChange={setTagIds} />
      <Button onClick={handleStart} size="lg" className="w-full">
        Start Focus
      </Button>
    </div>
  )
}
