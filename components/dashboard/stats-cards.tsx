'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Clock, Flame, Target, Calendar } from 'lucide-react'

interface Stats {
  todayMinutes: number
  streak: number
  totalSessions: number
  weekMinutes: number
}

export function StatsCards() {
  const [stats, setStats] = useState<Stats>({ todayMinutes: 0, streak: 0, totalSessions: 0, weekMinutes: 0 })

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const now = new Date()
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
      const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()).toISOString()

      const [todayRes, weekRes, allRes] = await Promise.all([
        supabase.from('sessions').select('duration_seconds').gte('started_at', todayStart),
        supabase.from('sessions').select('duration_seconds').gte('started_at', weekStart),
        supabase.from('sessions').select('started_at').order('started_at', { ascending: false }),
      ])

      const todayMinutes = Math.round(
        (todayRes.data ?? []).reduce((sum, s) => sum + s.duration_seconds, 0) / 60
      )
      const weekMinutes = Math.round(
        (weekRes.data ?? []).reduce((sum, s) => sum + s.duration_seconds, 0) / 60
      )
      const totalSessions = allRes.data?.length ?? 0

      // Calculate streak
      let streak = 0
      if (allRes.data && allRes.data.length > 0) {
        const days = new Set(
          allRes.data
            .filter((s) => s.started_at)
            .map((s) => s.started_at!.split('T')[0])
        )
        const today = new Date()
        for (let i = 0; i < 365; i++) {
          const d = new Date(today)
          d.setDate(d.getDate() - i)
          const key = d.toISOString().split('T')[0]
          if (days.has(key)) {
            streak++
          } else if (i > 0) {
            break
          }
        }
      }

      setStats({ todayMinutes, streak, totalSessions, weekMinutes })
    }
    load()
  }, [])

  const items = [
    { label: 'Today', value: `${stats.todayMinutes}m`, icon: Clock },
    { label: 'Streak', value: `${stats.streak}d`, icon: Flame },
    { label: 'Sessions', value: stats.totalSessions.toString(), icon: Target },
    { label: 'This week', value: `${stats.weekMinutes}m`, icon: Calendar },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map(({ label, value, icon: Icon }) => (
        <Card key={label}>
          <CardContent className="flex items-center gap-3 py-3">
            <Icon className="size-4 text-muted-foreground" />
            <div>
              <p className="text-lg font-semibold">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
