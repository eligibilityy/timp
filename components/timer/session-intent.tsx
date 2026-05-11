'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { TagSelector } from '@/components/session/tag-selector'
import { useTimerStore } from '@/store/timer-store'
import { Play } from 'lucide-react'

export function SessionIntent() {
  const { status, setIntent, start } = useTimerStore()
  const [title, setTitle] = useState('')
  const [tagIds, setTagIds] = useState<string[]>([])

  if (status !== 'idle') return null

  const handleStart = () => {
    setIntent(title, tagIds)
    start()
  }

  return (
    <div className="w-full max-w-sm space-y-4">
      <Input
        placeholder="What are you working on?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleStart()}
      />
      <TagSelector selected={tagIds} onChange={setTagIds} />
      <Button onClick={handleStart} className="w-full">
        <Play className="mr-2 size-4" />
        Start Focus
      </Button>
    </div>
  )
}
