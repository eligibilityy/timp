'use client'

import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface ContributionGraphProps {
  data: Record<string, number> // { 'YYYY-MM-DD': minutes }
}

function getIntensity(minutes: number): string {
  if (minutes === 0) return 'bg-muted'
  if (minutes < 30) return 'bg-emerald-200 dark:bg-emerald-900'
  if (minutes < 60) return 'bg-emerald-300 dark:bg-emerald-700'
  if (minutes < 120) return 'bg-emerald-500 dark:bg-emerald-500'
  return 'bg-emerald-700 dark:bg-emerald-300'
}

export function ContributionGraph({ data }: ContributionGraphProps) {
  const today = new Date()
  const weeks: { date: Date; key: string; minutes: number }[][] = []

  // Build 52 weeks of data (364 days) ending today
  const startDate = new Date(today)
  startDate.setDate(startDate.getDate() - 363)
  // Align to Sunday
  startDate.setDate(startDate.getDate() - startDate.getDay())

  let currentWeek: { date: Date; key: string; minutes: number }[] = []
  const d = new Date(startDate)

  while (d <= today) {
    const key = d.toISOString().split('T')[0]
    currentWeek.push({ date: new Date(d), key, minutes: data[key] || 0 })
    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
    d.setDate(d.getDate() + 1)
  }
  if (currentWeek.length > 0) weeks.push(currentWeek)

  const months: { label: string; col: number }[] = []
  let lastMonth = -1
  weeks.forEach((week, i) => {
    const month = week[0].date.getMonth()
    if (month !== lastMonth) {
      months.push({ label: week[0].date.toLocaleString('default', { month: 'short' }), col: i })
      lastMonth = month
    }
  })

  return (
    <div className="overflow-x-auto">
      <div className="inline-block">
        {/* Month labels */}
        <div className="flex text-xs text-muted-foreground mb-1 ml-8">
          {months.map((m, i) => (
            <span
              key={i}
              className="absolute"
              style={{ marginLeft: `${m.col * 14}px` }}
            >
              {m.label}
            </span>
          ))}
        </div>
        <div className="flex gap-[3px] mt-5">
          {/* Day labels */}
          <div className="flex flex-col gap-[3px] text-[10px] text-muted-foreground pr-1">
            <span className="h-[11px]" />
            <span className="h-[11px] leading-[11px]">Mon</span>
            <span className="h-[11px]" />
            <span className="h-[11px] leading-[11px]">Wed</span>
            <span className="h-[11px]" />
            <span className="h-[11px] leading-[11px]">Fri</span>
            <span className="h-[11px]" />
          </div>
          {/* Grid */}
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day) => (
                <Tooltip key={day.key}>
                  <TooltipTrigger
                    className={cn(
                      'size-[11px] rounded-[2px] transition-colors',
                      getIntensity(day.minutes)
                    )}
                  />
                  <TooltipContent>
                    {day.minutes > 0
                      ? `${day.minutes} min on ${day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                      : `No activity on ${day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                    }
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          ))}
        </div>
        {/* Legend */}
        <div className="flex items-center gap-1 mt-2 ml-8 text-[10px] text-muted-foreground">
          <span>Less</span>
          <div className="size-[11px] rounded-[2px] bg-muted" />
          <div className="size-[11px] rounded-[2px] bg-emerald-200 dark:bg-emerald-900" />
          <div className="size-[11px] rounded-[2px] bg-emerald-300 dark:bg-emerald-700" />
          <div className="size-[11px] rounded-[2px] bg-emerald-500 dark:bg-emerald-500" />
          <div className="size-[11px] rounded-[2px] bg-emerald-700 dark:bg-emerald-300" />
          <span>More</span>
        </div>
      </div>
    </div>
  )
}
