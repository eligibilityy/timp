'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Timer, History, BarChart3, Settings, LogOut, Sun, Moon } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

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
          <Tooltip key={href}>
            <TooltipTrigger
              render={<Link href={href} />}
              className={cn(
                'rounded-full p-2.5 transition-colors',
                pathname === href
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="size-4" />
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
          </Tooltip>
        ))}
        <div className="mx-1 h-4 w-px bg-border/50" />
        <Tooltip>
          <TooltipTrigger
            onClick={toggle}
            className="rounded-full p-2.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            {theme === 'light' ? <Moon className="size-4" /> : <Sun className="size-4" />}
          </TooltipTrigger>
          <TooltipContent>{theme === 'light' ? 'Dark mode' : 'Light mode'}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            onClick={handleSignOut}
            className="rounded-full p-2.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <LogOut className="size-4" />
          </TooltipTrigger>
          <TooltipContent>Sign out</TooltipContent>
        </Tooltip>
      </div>
    </nav>
  )
}
