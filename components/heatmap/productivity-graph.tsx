"use client";

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ProductivityGraphProps {
  data: Record<string, number>; // { 'YYYY-MM-DD': minutes }
}

function getIntensity(minutes: number): string {
  if (minutes === 0) return "bg-muted";
  if (minutes < 30) return "bg-blue-200 dark:bg-blue-900";
  if (minutes < 60) return "bg-blue-300 dark:bg-blue-700";
  if (minutes < 120) return "bg-blue-500 dark:bg-blue-500";
  return "bg-blue-700 dark:bg-blue-300";
}

export function ProductivityGraph({ data }: ProductivityGraphProps) {
  const today = new Date();
  const weeks: { date: Date; key: string; minutes: number }[][] = [];

  // Build 52 weeks of data (364 days) ending today
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 363);
  // Align to Sunday
  startDate.setDate(startDate.getDate() - startDate.getDay());

  let currentWeek: { date: Date; key: string; minutes: number }[] = [];
  const d = new Date(startDate);

  while (d <= today) {
    const key = d.toISOString().split("T")[0];
    currentWeek.push({ date: new Date(d), key, minutes: data[key] || 0 });
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    d.setDate(d.getDate() + 1);
  }
  if (currentWeek.length > 0) weeks.push(currentWeek);

  const months: { label: string; col: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, i) => {
    const month = week[0].date.getMonth();
    if (month !== lastMonth) {
      months.push({
        label: week[0].date.toLocaleString("default", { month: "short" }),
        col: i,
      });
      lastMonth = month;
    }
  });

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
        <div className="flex gap-0.75 mt-5">
          {/* Day labels */}
          <div className="flex flex-col gap-0.75 text-[10px] text-muted-foreground pr-1">
            <span className="h-2.75" />
            <span className="h-2.75 leading-2.75">Mon</span>
            <span className="h-2.75" />
            <span className="h-2.75 leading-2.75">Wed</span>
            <span className="h-2.75" />
            <span className="h-2.75 leading-2.75">Fri</span>
            <span className="h-2.75" />
          </div>
          {/* Grid */}
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-0.75">
              {week.map((day) => (
                <Tooltip key={day.key}>
                  <TooltipTrigger
                    className={cn(
                      "size-2.75 rounded-xs transition-colors",
                      getIntensity(day.minutes),
                    )}
                  />
                  <TooltipContent className="select-none pointer-events-none">
                    {day.minutes > 0
                      ? `${day.minutes} min on ${day.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                      : `No activity on ${day.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          ))}
        </div>
        {/* Legend */}
        <div className="flex items-center gap-1 mt-2 ml-8 text-[10px] text-muted-foreground">
          <span>Less</span>
          <div className="size-2.75 rounded-xs   bg-muted" />
          <div className="size-2.75 rounded-xs   bg-blue-200 dark:bg-blue-900" />
          <div className="size-2.75 rounded-xs   bg-blue-300 dark:bg-blue-700" />
          <div className="size-2.75 rounded-xs   bg-blue-500 dark:bg-blue-500" />
          <div className="size-2.75 rounded-xs   bg-blue-700 dark:bg-blue-300" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
