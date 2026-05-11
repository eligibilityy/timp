"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ContributionGraph } from "@/components/heatmap/contribution-graph";
import { Flame, Clock, Calendar, TrendingUp } from "lucide-react";

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
  const maxMinutes = Math.max(...weekData.map((d) => d.minutes), 1);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={<Flame className="size-4" />}
          label="Streak"
          value={`${streak}d`}
        />
        <StatCard
          icon={<Clock className="size-4" />}
          label="Total focus"
          value={`${Math.round(totalMinutes / 60)}h`}
        />
        <StatCard
          icon={<Calendar className="size-4" />}
          label="Sessions"
          value={String(totalSessions)}
        />
        <StatCard
          icon={<TrendingUp className="size-4" />}
          label="This week"
          value={`${weekTotal}m`}
        />
      </div>

      {/* Contribution Graph */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          Contributions
        </h2>
        <ContributionGraph data={heatmapData} />
      </div>

      {/* Weekly activity + Tags side by side */}
      {weekData.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Weekly bar chart */}
          <div className="rounded-2xl bg-secondary shadow-sm p-4 space-y-4">
            <div className="flex items-baseline justify-between">
              <h2 className="text-sm font-medium">This week</h2>
              <span className="text-xs text-muted-foreground tabular-nums">
                {weekTotal} min
              </span>
            </div>
            <div className="flex items-end gap-2 h-28">
              {weekData.map((d) => {
                const height = (d.minutes / maxMinutes) * 100;
                const isToday =
                  d.day === new Date().toISOString().split("T")[0];
                return (
                  <div
                    key={d.day}
                    className="flex flex-1 flex-col items-center gap-1.5"
                  >
                    <div className="w-full flex flex-col justify-end h-20">
                      <div
                        className={`w-full rounded-md transition-all ${isToday ? "bg-foreground" : "bg-foreground/25"}`}
                        style={{
                          height: `${height}%`,
                          minHeight: d.minutes > 0 ? "4px" : "0",
                        }}
                      />
                    </div>
                    <span
                      className={`text-[10px] ${isToday ? "text-foreground font-medium" : "text-muted-foreground"}`}
                    >
                      {d.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tag distribution */}
          {tagData.length > 0 && (
            <div className="rounded-2xl bg-secondary shadow-sm p-4 space-y-4">
              <h2 className="text-sm font-medium">Focus by category</h2>
              <div className="space-y-3">
                {tagData.map((tag) => (
                  <div key={tag.name} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium">{tag.name}</span>
                      <span className="text-muted-foreground tabular-nums">
                        {tag.minutes}m
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
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
            </div>
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
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-secondary shadow-sm p-4 space-y-2">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-2xl font-semibold tabular-nums tracking-tight">
        {value}
      </p>
    </div>
  );
}
