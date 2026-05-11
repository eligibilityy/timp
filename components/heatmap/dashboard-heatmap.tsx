'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FocusHeatmap } from '@/components/heatmap/focus-heatmap'

export function DashboardHeatmap() {
  const [data, setData] = useState<{ day: string; value: number }[]>([])

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const yearAgo = new Date()
      yearAgo.setFullYear(yearAgo.getFullYear() - 1)

      const { data: sessions } = await supabase
        .from('sessions')
        .select('duration_seconds, started_at')
        .gte('started_at', yearAgo.toISOString())

      if (!sessions) return

      const byDay: Record<string, number> = {}
      for (const s of sessions) {
        if (!s.started_at) continue
        const day = s.started_at.split('T')[0]
        byDay[day] = (byDay[day] || 0) + Math.round(s.duration_seconds / 60)
      }

      setData(Object.entries(byDay).map(([day, value]) => ({ day, value })))
    }
    load()
  }, [])

  return <FocusHeatmap data={data} />
}
