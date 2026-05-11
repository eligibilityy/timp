'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Timer, History, BarChart3, Settings, LogOut, Sun, Moon } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'

const links = [
  { href: '/dashboard', label: 'Focus', icon: Timer },
  { href: '/history', label: 'History', icon: History },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function TopNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, toggle } = useTheme()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="border-b border-border/50">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/dashboard" className="text-lg font-semibold tracking-tight">
          timp
        </Link>
        <nav className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors',
                pathname === href
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="size-4" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
          <button
            onClick={toggle}
            className="ml-1 flex items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon className="size-4" /> : <Sun className="size-4" />}
          </button>
          <button
            onClick={handleSignOut}
            className="flex items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Sign out"
          >
            <LogOut className="size-4" />
          </button>
        </nav>
      </div>
    </header>
  )
}
