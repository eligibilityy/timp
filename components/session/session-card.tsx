'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Clock, Star } from 'lucide-react'

interface SessionCardProps {
  title: string | null
  reflection: string | null
  duration_seconds: number
  focus_score: number | null
  started_at: string | null
  tags: { name: string; color: string | null }[]
}

export function SessionCard({ title, reflection, duration_seconds, focus_score, started_at, tags }: SessionCardProps) {
  const minutes = Math.round(duration_seconds / 60)
  const time = started_at
    ? new Date(started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null

  return (
    <Card>
      <CardContent className="space-y-2 py-4">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <p className="font-medium">{title || 'Untitled session'}</p>
            {reflection && (
              <p className="text-sm text-muted-foreground line-clamp-2">{reflection}</p>
            )}
          </div>
          {focus_score && (
            <div className="flex items-center gap-0.5 text-sm text-muted-foreground">
              <Star className="size-3.5" />
              {focus_score}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="size-3" />
            {minutes} min
          </span>
          {time && <span>{time}</span>}
          {tags.length > 0 && (
            <div className="flex gap-1">
              {tags.map((tag) => (
                <span key={tag.name} className="rounded-full bg-muted px-2 py-0.5">
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
