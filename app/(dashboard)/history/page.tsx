import { createClient } from '@/lib/supabase/server'
import { SessionCard } from '@/components/session/session-card'

interface SessionRow {
  id: string
  title: string | null
  reflection: string | null
  duration_seconds: number
  focus_score: number | null
  started_at: string | null
  created_at: string
  session_tags: { tag_id: string; tags: { name: string; color: string | null } | null }[]
}

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: sessions } = await supabase
    .from('sessions')
    .select('*, session_tags(tag_id, tags(name, color))')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const grouped = groupByDate((sessions ?? []) as unknown as SessionRow[])

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">History</h1>
      {Object.keys(grouped).length === 0 ? (
        <p className="text-muted-foreground">
          No sessions yet. Complete a focus cycle to see your history here.
        </p>
      ) : (
        Object.entries(grouped).map(([date, items]) => (
          <div key={date} className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground">{date}</h2>
            <div className="space-y-2">
              {items.map((session) => (
                <SessionCard
                  key={session.id}
                  title={session.title}
                  reflection={session.reflection}
                  duration_seconds={session.duration_seconds}
                  focus_score={session.focus_score}
                  started_at={session.started_at}
                  tags={
                    session.session_tags?.map((st) => st.tags).filter(Boolean) as { name: string; color: string | null }[]
                  }
                />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

function groupByDate(sessions: SessionRow[]) {
  const groups: Record<string, SessionRow[]> = {}
  for (const session of sessions) {
    const date = new Date(session.created_at).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    })
    if (!groups[date]) groups[date] = []
    groups[date].push(session)
  }
  return groups
}
