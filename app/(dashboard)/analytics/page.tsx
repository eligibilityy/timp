"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ProductivityGraph } from "@/components/heatmap/productivity-graph";
import { Flame, Clock, Calendar, TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface DayData {
  day: string;
  label: string;
  minutes: number;
}
interface TagData {
  name: string;
  minutes: number;
  color: string;
}

const chartConfig = {
  minutes: {
    label: "Minutes",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export default function AnalyticsPage() {
  const [weekData, setWeekData] = useState<DayData[]>([]);
  const [tagData, setTagData] = useState<TagData[]>([]);
  const [heatmapData, setHeatmapData] = useState<Record<string, number>>({});
  const [streak, setStreak] = useState(0);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const now = new Date();
      const yearAgo = new Date(now);
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);

      const { data: sessions } = await supabase
        .from("sessions")
        .select(
          "duration_seconds, started_at, session_tags(tag_id, tags(name, color))",
        )
        .gte("started_at", yearAgo.toISOString());

      if (!sessions) return;

      setTotalSessions(sessions.length);

      // Heatmap data (full year)
      const byDay: Record<string, number> = {};
      let total = 0;
      for (const s of sessions) {
        if (!s.started_at) continue;
        const day = s.started_at.split("T")[0];
        const mins = Math.round(s.duration_seconds / 60);
        byDay[day] = (byDay[day] || 0) + mins;
        total += mins;
      }
      setHeatmapData(byDay);
      setTotalMinutes(total);

      // Calculate streak
      let currentStreak = 0;
      const d = new Date(now);
      while (true) {
        const key = d.toISOString().split("T")[0];
        if (byDay[key] && byDay[key] > 0) {
          currentStreak++;
          d.setDate(d.getDate() - 1);
        } else {
          break;
        }
      }
      setStreak(currentStreak);

      // Weekly bar chart (last 7 days)
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - 6);
      weekStart.setHours(0, 0, 0, 0);
      const weekSessions = sessions.filter(
        (s) => s.started_at && new Date(s.started_at) >= weekStart,
      );

      const days: DayData[] = [];
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      for (let i = 6; i >= 0; i--) {
        const dd = new Date(now);
        dd.setDate(dd.getDate() - i);
        const key = dd.toISOString().split("T")[0];
        const mins = weekSessions
          .filter((s) => s.started_at?.startsWith(key))
          .reduce((sum, s) => sum + Math.round(s.duration_seconds / 60), 0);
        days.push({ day: key, label: dayNames[dd.getDay()], minutes: mins });
      }
      setWeekData(days);

      // Tag distribution
      const tagMap: Record<string, { minutes: number; color: string }> = {};
      for (const s of weekSessions) {
        const tags =
          (
            s as unknown as {
              session_tags: {
                tags: { name: string; color: string | null } | null;
              }[];
            }
          ).session_tags ?? [];
        for (const st of tags) {
          const tag = st.tags;
          if (!tag) continue;
          if (!tagMap[tag.name])
            tagMap[tag.name] = { minutes: 0, color: tag.color || "#6b7280" };
          tagMap[tag.name].minutes += Math.round(s.duration_seconds / 60);
        }
      }
      setTagData(
        Object.entries(tagMap)
          .map(([name, { minutes, color }]) => ({ name, minutes, color }))
          .sort((a, b) => b.minutes - a.minutes),
      );
    }
    load();
  }, []);

  const weekTotal = weekData.reduce((s, d) => s + d.minutes, 0);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-8">Analytics</h1>

      <div className="space-y-2">
        {/* Stats row */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <StatCard
            icon={<Flame className="size-6 stroke-2 fill-white text-white" />}
            iconBgClassName="bg-orange-300 dark:bg-orange-400"
            label="Streak"
            value={`${streak} ${streak === 1 ? "day" : "days"}`}
          />
          <StatCard
            icon={<Clock className="size-6 stroke-2 text-white" />}
            iconBgClassName="bg-blue-400"
            label="Total focus"
            value={`${Math.round(totalMinutes / 60)} ${Math.round(totalMinutes / 60) === 1 ? "hour" : "hours"}`}
          />
          <StatCard
            icon={<Calendar className="size-6 stroke-2 text-white" />}
            iconBgClassName="bg-purple-400"
            label="Sessions"
            value={`${totalSessions} ${totalSessions === 1 ? "session" : "sessions"}`}
          />
          <StatCard
            icon={
              <TrendingUp className="size-6 stroke-2 fill-white text-white" />
            }
            iconBgClassName="bg-emerald-400"
            label="This week"
            value={`${weekTotal} minutes`}
          />
        </div>

        {/* Productivity Graph */}
        <ProductivityGraph data={heatmapData} />

        {/* Weekly activity + Tags side by side */}
        {weekData.length > 0 && (
          <div className="grid gap-2 md:grid-cols-2">
            {/* Weekly bar chart */}
            <Card className="justify-between">
              <CardHeader>
                <CardTitle>Focus this week</CardTitle>
                <CardDescription>
                  You have focused for {weekTotal} minutes this week.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <BarChart accessibilityLayer data={weekData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel className="animate-in fade-in-0 duration-150" />}
                    />
                    <Bar
                      dataKey="minutes"
                      fill="var(--color-minutes)"
                      radius={8}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Tag distribution */}
            {tagData.length > 0 && (
              <Card className="justify-between">
                <CardHeader>
                  <CardTitle>Focus by category</CardTitle>
                  <CardDescription>
                    How your time was distributed this week.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {tagData.map((tag) => (
                    <div key={tag.name} className="flex items-center gap-3">
                      <div
                        className="size-3 rounded-full shrink-0"
                        style={{ backgroundColor: tag.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1.5">
                          <span className="text-sm font-medium truncate">
                            {tag.name}
                          </span>
                          <span className="text-xs text-muted-foreground tabular-nums ml-2">
                            {tag.minutes} min
                          </span>
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
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {weekData.length === 0 && Object.keys(heatmapData).length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <TrendingUp className="size-5 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              Complete some focus sessions to see your analytics here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  iconBgClassName = "bg-muted-foreground/20",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  iconBgClassName?: string;
}) {
  return (
    <Card className="w-full max-w-sm">
      <CardContent className="flex flex-col items-center justify-center gap-2">
        <div
          className={`${iconBgClassName} size-10 rounded-full flex items-center justify-center`}
        >
          {icon}
        </div>
        <div className="flex flex-col items-center">
          <p className="text-xl font-medium tabular-nums tracking-tight">
            {value}
          </p>
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
      </CardContent>
    </Card>
  );
}
