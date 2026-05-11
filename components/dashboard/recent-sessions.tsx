'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Clock } from 'lucide-react'

interface RecentSession {
  id: string
  title: string | null
  duration_seconds: number
  started_at: string | null
}

export function RecentSessions() {
  const [sessions, setSessions] = useState<RecentSession[]>([])

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('sessions')
        .select('id, title, duration_seconds, started_at')
        .order('created_at', { ascending: false })
        .limit(5)

      setSessions(data ?? [])
    }
    load()
  }, [])

  if (sessions.length === 0) return null

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-medium text-muted-foreground">Recent sessions</h2>
      <div className="space-y-2">
        {sessions.map((s) => (
          <div key={s.id} className="flex items-center justify-between rounded-md border px-3 py-2">
            <span className="text-sm">{s.title || 'Untitled'}</span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="size-3" />
              {Math.round(s.duration_seconds / 60)}m
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
