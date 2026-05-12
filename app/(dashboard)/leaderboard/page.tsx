"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Trophy } from "lucide-react";

type Period = "today" | "week" | "all";

interface LeaderboardEntry {
  user_id: string;
  display_name: string | null;
  role: string | null;
  total_minutes: number;
  session_count: number;
}

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<Period>("today");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    const now = new Date();
    let startDate: string | null = null;

    if (period === "today") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    } else if (period === "week") {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      startDate = new Date(now.getFullYear(), now.getMonth(), diff).toISOString();
    }

    let query = supabase
      .from("sessions")
      .select("user_id, duration_seconds, profiles!inner(display_name, role)");

    if (startDate) {
      query = query.gte("started_at", startDate);
    }

    query.then(({ data }) => {
      if (cancelled) return;
      if (!data) { setEntries([]); setLoading(false); return; }

      const grouped: Record<string, { display_name: string | null; role: string | null; total_seconds: number; count: number }> = {};
      for (const row of data as unknown as { user_id: string; duration_seconds: number; profiles: { display_name: string | null; role: string | null } }[]) {
        if (!grouped[row.user_id]) {
          grouped[row.user_id] = { display_name: row.profiles?.display_name ?? null, role: row.profiles?.role ?? null, total_seconds: 0, count: 0 };
        }
        grouped[row.user_id].total_seconds += row.duration_seconds;
        grouped[row.user_id].count += 1;
      }

      const sorted = Object.entries(grouped)
        .map(([user_id, v]) => ({
          user_id,
          display_name: v.display_name,
          role: v.role,
          total_minutes: Math.round(v.total_seconds / 60),
          session_count: v.count,
        }))
        .sort((a, b) => b.total_minutes - a.total_minutes)
        .slice(0, 50);

      setEntries(sorted);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [period]);

  return (
    <div className="space-y-8">
      <PageHeader title="Leaderboard" />

      <div className="flex gap-1">
        {(["today", "week", "all"] as Period[]).map((p) => (
          <Button
            key={p}
            variant="secondary"
            onClick={() => setPeriod(p)}
            className={cn(
              "capitalize text-xs",
              period === p
                ? "bg-foreground text-background hover:bg-foreground/90"
                : "text-muted-foreground",
            )}
          >
            {p === "all" ? "All Time" : p === "week" ? "This Week" : "Today"}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Trophy className="size-5 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">No sessions recorded for this period yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, i) => (
            <div
              key={entry.user_id}
              className="flex items-center gap-4 rounded-lg border border-border/50 px-4 py-3"
            >
              <span className={cn(
                "text-sm font-semibold w-6 text-center",
                i === 0 && "text-amber-500",
                i === 1 && "text-gray-400",
                i === 2 && "text-amber-700",
              )}>
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate flex items-center gap-1.5">
                  {entry.display_name || "Anonymous"}
                  {entry.role && (
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-primary">
                      {entry.role}
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {entry.session_count} sessions
                </p>
              </div>
              <span className="text-sm font-semibold tabular-nums">
                {entry.total_minutes}m
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
