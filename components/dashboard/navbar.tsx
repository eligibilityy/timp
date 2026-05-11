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
    <nav className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center gap-1 rounded-full border border-border/50 bg-background/80 px-2 py-2 backdrop-blur-lg">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            title={label}
            className={cn(
              'relative group rounded-full p-2.5 transition-colors',
              pathname === href
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className="size-4" />
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-md bg-foreground px-2 py-1 text-[10px] text-background opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none whitespace-nowrap">
              {label}
            </span>
          </Link>
        ))}
        <div className="mx-1 h-4 w-px bg-border/50" />
        <button
          onClick={toggle}
          title={theme === 'light' ? 'Dark mode' : 'Light mode'}
          className="relative group rounded-full p-2.5 text-muted-foreground transition-colors hover:text-foreground"
        >
          {theme === 'light' ? <Moon className="size-4" /> : <Sun className="size-4" />}
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-md bg-foreground px-2 py-1 text-[10px] text-background opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none whitespace-nowrap">
            {theme === 'light' ? 'Dark mode' : 'Light mode'}
          </span>
        </button>
        <button
          onClick={handleSignOut}
          title="Sign out"
          className="relative group rounded-full p-2.5 text-muted-foreground transition-colors hover:text-foreground"
        >
          <LogOut className="size-4" />
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-md bg-foreground px-2 py-1 text-[10px] text-background opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none whitespace-nowrap">
            Sign out
          </span>
        </button>
      </div>
    </nav>
  )
}
