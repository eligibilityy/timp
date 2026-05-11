'use client'

import { ResponsiveCalendar } from '@nivo/calendar'

interface HeatmapData {
  day: string // YYYY-MM-DD
  value: number // total minutes
}

interface FocusHeatmapProps {
  data: HeatmapData[]
}

export function FocusHeatmap({ data }: FocusHeatmapProps) {
  const today = new Date()
  const yearAgo = new Date(today)
  yearAgo.setFullYear(yearAgo.getFullYear() - 1)

  const from = yearAgo.toISOString().split('T')[0]
  const to = today.toISOString().split('T')[0]

  if (data.length === 0) {
    return (
      <div className="flex h-36 items-center justify-center rounded-lg border border-dashed">
        <p className="text-sm text-muted-foreground">
          Complete focus sessions to fill your heatmap
        </p>
      </div>
    )
  }

  return (
    <div className="h-36">
      <ResponsiveCalendar
        data={data}
        from={from}
        to={to}
        emptyColor="hsl(var(--muted))"
        colors={['#d1d5db', '#9ca3af', '#6b7280', '#374151']}
        margin={{ top: 20, right: 0, bottom: 0, left: 20 }}
        yearSpacing={40}
        monthBorderColor="transparent"
        dayBorderWidth={2}
        dayBorderColor="hsl(var(--background))"
        legends={[]}
      />
    </div>
  )
}
