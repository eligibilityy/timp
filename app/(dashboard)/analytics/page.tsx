'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { ContributionGraph } from '@/components/heatmap/contribution-graph'

interface DayData { day: string; label: string; minutes: number }
interface TagData { name: string; minutes: number; color: string }

export default function AnalyticsPage() {
  const [weekData, setWeekData] = useState<DayData[]>([])
  const [tagData, setTagData] = useState<TagData[]>([])
  const [totalWeek, setTotalWeek] = useState(0)
  const [heatmapData, setHeatmapData] = useState<Record<string, number>>({})

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const now = new Date()
      const yearAgo = new Date(now)
      yearAgo.setFullYear(yearAgo.getFullYear() - 1)

      const { data: sessions } = await supabase
        .from('sessions')
        .select('duration_seconds, started_at, session_tags(tag_id, tags(name, color))')
        .gte('started_at', yearAgo.toISOString())

      if (!sessions) return

      // Heatmap data (full year)
      const byDay: Record<string, number> = {}
      for (const s of sessions) {
        if (!s.started_at) continue
        const day = s.started_at.split('T')[0]
        byDay[day] = (byDay[day] || 0) + Math.round(s.duration_seconds / 60)
      }
      setHeatmapData(byDay)

      // Weekly bar chart (last 7 days)
      const weekStart = new Date(now)
      weekStart.setDate(weekStart.getDate() - 6)
      weekStart.setHours(0, 0, 0, 0)
      const weekSessions = sessions.filter((s) => s.started_at && new Date(s.started_at) >= weekStart)

      const days: DayData[] = []
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now)
        d.setDate(d.getDate() - i)
        const key = d.toISOString().split('T')[0]
        const mins = weekSessions
          .filter((s) => s.started_at?.startsWith(key))
          .reduce((sum, s) => sum + Math.round(s.duration_seconds / 60), 0)
        days.push({ day: key, label: dayNames[d.getDay()], minutes: mins })
      }
      setWeekData(days)
      setTotalWeek(days.reduce((s, d) => s + d.minutes, 0))

      // Tag distribution
      const tagMap: Record<string, { minutes: number; color: string }> = {}
      for (const s of weekSessions) {
        const tags = (s as any).session_tags ?? []
        for (const st of tags) {
          const tag = st.tags
          if (!tag) continue
          if (!tagMap[tag.name]) tagMap[tag.name] = { minutes: 0, color: tag.color || '#6b7280' }
          tagMap[tag.name].minutes += Math.round(s.duration_seconds / 60)
        }
      }
      setTagData(
        Object.entries(tagMap)
          .map(([name, { minutes, color }]) => ({ name, minutes, color }))
          .sort((a, b) => b.minutes - a.minutes)
      )
    }
    load()
  }, [])

  const maxMinutes = Math.max(...weekData.map((d) => d.minutes), 1)

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>

      {/* Contribution Graph */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">Contributions</h2>
        <ContributionGraph data={heatmapData} />
      </div>

      {weekData.length > 0 && (
        <>
          {/* Weekly bar chart */}
          <Card>
            <CardContent className="space-y-4 py-6">
              <div className="flex items-baseline justify-between">
                <h2 className="font-medium">This week</h2>
                <span className="text-sm text-muted-foreground">{totalWeek} min</span>
              </div>
              <div className="flex items-end gap-2 h-32">
                {weekData.map((d) => (
                  <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
                    <div className="w-full flex flex-col justify-end h-24">
                      <div
                        className="w-full rounded-sm bg-foreground/80 transition-all"
                        style={{ height: `${(d.minutes / maxMinutes) * 100}%`, minHeight: d.minutes > 0 ? '4px' : '0' }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{d.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tag distribution */}
          {tagData.length > 0 && (
            <Card>
              <CardContent className="space-y-4 py-6">
                <h2 className="font-medium">Focus by category</h2>
                <div className="space-y-3">
                  {tagData.map((tag) => (
                    <div key={tag.name} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{tag.name}</span>
                        <span className="text-muted-foreground">{tag.minutes}m</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${(tag.minutes / tagData[0].minutes) * 100}%`,
                            backgroundColor: tag.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {weekData.length === 0 && Object.keys(heatmapData).length === 0 && (
        <p className="text-muted-foreground">
          Complete some focus sessions to see your analytics here.
        </p>
      )}
    </div>
  )
}
