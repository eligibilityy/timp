import { createClient } from '@/lib/supabase/client'

export async function createSession(data: {
  title: string | null
  reflection: string | null
  duration_seconds: number
  focus_score: number | null
  started_at: string | null
  ended_at: string | null
  tagIds: string[]
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: session, error } = await supabase
    .from('sessions')
    .insert({
      user_id: user.id,
      title: data.title,
      reflection: data.reflection,
      duration_seconds: data.duration_seconds,
      focus_score: data.focus_score,
      started_at: data.started_at,
      ended_at: data.ended_at,
    })
    .select()
    .single()

  if (error) throw error

  if (data.tagIds.length > 0) {
    const { error: tagError } = await supabase
      .from('session_tags')
      .insert(data.tagIds.map((tag_id) => ({ session_id: session.id, tag_id })))

    if (tagError) throw tagError
  }

  return session
}

export async function getTags() {
  const supabase = createClient()
  const { data } = await supabase
    .from('tags')
    .select('*')
    .order('name')

  return data ?? []
}


export async function createTag(name: string, color: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('tags')
    .insert({ user_id: user.id, name: name.trim(), color })
    .select()
    .single()

  if (error) throw error
  return data
}
