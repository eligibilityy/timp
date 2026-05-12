import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: sessions } = await supabase
    .from("sessions")
    .select("title, reflection, duration_seconds, focus_score, started_at, ended_at, session_tags(tag_id, tags(name))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const rows = (sessions ?? []).map((s: Record<string, unknown>) => ({
    title: (s.title as string) ?? "Untitled",
    reflection: (s.reflection as string) ?? "",
    duration_minutes: Math.round((s.duration_seconds as number) / 60),
    focus_score: (s.focus_score as number) ?? "",
    started_at: (s.started_at as string) ?? "",
    ended_at: (s.ended_at as string) ?? "",
    tags: ((s.session_tags as { tags: { name: string } | null }[]) ?? [])
      .map((t) => t.tags?.name)
      .filter(Boolean)
      .join("; "),
  }));

  const format = request.nextUrl.searchParams.get("format");

  if (format === "json") {
    return NextResponse.json(rows, {
      headers: { "Content-Disposition": "attachment; filename=sessions.json" },
    });
  }

  const headers = ["title", "reflection", "duration_minutes", "focus_score", "started_at", "ended_at", "tags"];
  const csv = [
    headers.join(","),
    ...rows.map((r) =>
      headers.map((h) => `"${String(r[h as keyof typeof r]).replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=sessions.csv",
    },
  });
}
