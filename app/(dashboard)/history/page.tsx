import { createClient } from "@/lib/supabase/server";
import { Clock, Star } from "lucide-react";
import { DeleteSessionButton } from "@/components/session/delete-session-button";
import { PageHeader } from "@/components/dashboard/page-header";

interface SessionRow {
  id: string;
  title: string | null;
  reflection: string | null;
  duration_seconds: number;
  focus_score: number | null;
  started_at: string | null;
  created_at: string;
  session_tags: {
    tag_id: string;
    tags: { name: string; color: string | null } | null;
  }[];
}

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: sessions } = await supabase
    .from("sessions")
    .select("*, session_tags(tag_id, tags(name, color))")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const grouped = groupByDate((sessions ?? []) as unknown as SessionRow[]);
  const totalSessions = sessions?.length ?? 0;
  const totalMinutes = (sessions ?? []).reduce(
    (sum, s) =>
      sum + Math.round((s as unknown as SessionRow).duration_seconds / 60),
    0,
  );

  return (
    <div className="space-y-8">
      {/* Header with stats */}
      <PageHeader title="History">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="size-4" />
              {totalMinutes} min
            </div>
            ·
            <div className="flex items-center gap-2 text-sm">
              <Star className="size-4 fill-current" />
              {totalSessions} sessions
            </div>
          </div>
          {totalSessions > 0 && (
            <a
              href="/history/export"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
            >
              Export CSV
            </a>
          )}
        </div>
      </PageHeader>

      {Object.keys(grouped).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Clock className="size-5 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">
            No sessions yet. Complete a focus cycle to see your history here.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date} className="relative">
              {/* Date header */}
              <div className="pb-3">
                <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {date}
                </h2>
              </div>

              {/* Timeline */}
              <div className="relative pl-6 border-l border-border/50 space-y-4 ml-2">
                {items.map((session) => {
                  const minutes = Math.round(session.duration_seconds / 60);
                  const time = session.started_at
                    ? new Date(session.started_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : null;
                  const tags = session.session_tags
                    ?.map((st) => st.tags)
                    .filter(Boolean) as {
                    name: string;
                    color: string | null;
                  }[];

                  return (
                    <div key={session.id} className="relative group">
                      {/* Timeline dot */}
                      <div className="absolute -left-7 top-2 size-2 rounded-full bg-muted group-hover:bg-foreground/60 transition-colors ring-2 ring-background" />

                      {/* Card */}
                      <div className="rounded-2xl bg-secondary shadow-sm p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 min-w-0">
                            <p className="font-medium truncate">
                              {session.title || "Untitled session"}
                            </p>
                            {session.reflection && (
                              <p className="text-sm text-muted-foreground line-clamp-2 flex items-start gap-2">
                                <span>{session.reflection}</span>
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {session.focus_score && (
                              <div className="flex items-center gap-0.5 text-xs font-medium text-amber-500 dark:text-amber-400">
                                <Star className="size-3 fill-current" />
                                {session.focus_score}
                              </div>
                            )}
                            <DeleteSessionButton
                              session={{
                                id: session.id,
                                user_id: user!.id,
                                title: session.title,
                                reflection: session.reflection,
                                duration_seconds: session.duration_seconds,
                                focus_score: session.focus_score,
                                started_at: session.started_at,
                                ended_at: (
                                  session as unknown as {
                                    ended_at: string | null;
                                  }
                                ).ended_at,
                                created_at: session.created_at,
                                tagIds:
                                  session.session_tags?.map(
                                    (st) => st.tag_id,
                                  ) ?? [],
                              }}
                            />
                          </div>
                        </div>

                        {/* Meta row */}
                        <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1 font-medium tabular-nums">
                            <Clock className="size-3" />
                            {minutes}m
                          </span>
                          {time && <span className="tabular-nums">{time}</span>}
                          {tags.length > 0 && (
                            <div className="flex gap-1 ml-auto">
                              {tags.map((tag) => (
                                <span
                                  key={tag.name}
                                  className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                                  style={{
                                    backgroundColor: `${tag.color || "#6b7280"}20`,
                                    color: tag.color || "#6b7280",
                                  }}
                                >
                                  {tag.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function groupByDate(sessions: SessionRow[]) {
  const groups: Record<string, SessionRow[]> = {};
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  for (const session of sessions) {
    const sessionDate = new Date(session.created_at);
    let label: string;

    if (sessionDate.toDateString() === today.toDateString()) {
      label = "Today";
    } else if (sessionDate.toDateString() === yesterday.toDateString()) {
      label = "Yesterday";
    } else {
      label = sessionDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
    }

    if (!groups[label]) groups[label] = [];
    groups[label].push(session);
  }
  return groups;
}
