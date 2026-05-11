export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          display_name: string | null
          avatar_url: string | null
          timezone: string | null
          settings: UserSettings | null
          created_at: string
        }
        Insert: {
          id: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          timezone?: string | null
          settings?: UserSettings | null
          created_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          timezone?: string | null
          settings?: UserSettings | null
          created_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          user_id: string
          title: string | null
          reflection: string | null
          duration_seconds: number
          focus_score: number | null
          started_at: string | null
          ended_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string | null
          reflection?: string | null
          duration_seconds: number
          focus_score?: number | null
          started_at?: string | null
          ended_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string | null
          reflection?: string | null
          duration_seconds?: number
          focus_score?: number | null
          started_at?: string | null
          ended_at?: string | null
          created_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          name: string
          color: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          color?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string | null
          created_at?: string
        }
      }
      session_tags: {
        Row: {
          session_id: string
          tag_id: string
        }
        Insert: {
          session_id: string
          tag_id: string
        }
        Update: {
          session_id?: string
          tag_id?: string
        }
      }
    }
  }
}

export type UserSettings = {
  workDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  cyclesBeforeLongBreak: number
  autoAdvance: boolean
}

export type Session = Database['public']['Tables']['sessions']['Row']
export type Tag = Database['public']['Tables']['tags']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
