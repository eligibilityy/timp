'use client'

import { useEffect, useState } from 'react'
import { getTags } from '@/lib/supabase/sessions'
import { cn } from '@/lib/utils'
import type { Tag } from '@/types/database'

interface TagSelectorProps {
  selected: string[]
  onChange: (ids: string[]) => void
}

export function TagSelector({ selected, onChange }: TagSelectorProps) {
  const [tags, setTags] = useState<Tag[]>([])

  useEffect(() => {
    getTags().then(setTags)
  }, [])

  const toggle = (id: string) => {
    onChange(
      selected.includes(id)
        ? selected.filter((t) => t !== id)
        : [...selected, id]
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <button
          key={tag.id}
          type="button"
          onClick={() => toggle(tag.id)}
          className={cn(
            'rounded-full border px-3 py-1 text-xs transition-colors',
            selected.includes(tag.id)
              ? 'border-foreground bg-foreground text-background'
              : 'border-border text-muted-foreground hover:border-foreground/50'
          )}
        >
          {tag.name}
        </button>
      ))}
    </div>
  )
}
